const express = require("express");
const fs = require("fs");
const Todo = require("./models/Todo");
const mongoose = require("mongoose");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


//MongoDB Connection
const dbUri = process.env.MONGO_URI;  // Replace with your actual MongoDB URI

mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));

// Load System Instruction from File
const SYSTEM_INSTRUCTION = fs.readFileSync(path.join(__dirname, "system_instruction.txt"), "utf-8");
// console.log("System Instruction:", SYSTEM_INSTRUCTION);

// Load API Key
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_API_KEY);  // Replace with your actual

// Store Last 5 Conversations for Context Memory
const chatHistory = [];

// Function to Maintain Last 5 Conversations
function updateChatHistory(userMessage, aiResponse) {
  chatHistory.push({ user: userMessage, ai: aiResponse });
  if (chatHistory.length > 5) {
    chatHistory.shift(); // Remove the oldest conversation if more than 5
  }
}

// Enhanced Function Declarations
const todoFunctionDeclarations = [
  {
    name: "create_todo",
    parameters: {
      type: "OBJECT",
      description: "Create a new todo item",
      properties: {
        task: { type: "STRING", description: "The task description" },
      },
      required: ["task"],
    },
  },
  {
    name: "show_todos",
    parameters: {
      type: "OBJECT",
      description: "Retrieve all todos",
      properties: {
        random: { type: "STRING", description: "Random string" },
      },
    },
  },
  {
    name: "update_todo",
    parameters: {
      type: "OBJECT",
      description: "Update an existing todo",
      properties: {
        task_name: { type: "STRING", description: "The name of the task to update" },
        new_task: { type: "STRING", description: "Updated task description" },
      },
      required: ["task_name", "new_task"],
    },
  },
  {
    name: "delete_todo",
    parameters: {
      type: "OBJECT",
      description: "Delete a todo",
      properties: {
        task_name: { type: "STRING", description: "The name of the task to delete" },
      },
      required: ["task_name"],
    },
  }
];

// 🔥 **Enhanced Functions with Smart Matching**
const functions = {
  create_todo: async ({ task }) => {
    const newTodo = new Todo({ task });
    await newTodo.save();
    console.log("New Todo Created in DB:", newTodo);
    return newTodo;
  },

  show_todos: async () => {
    const todos = await Todo.find();
    const TodoList = todos.map(todo => todo.task).join("\n");
    console.log("All Todos from DB:", TodoList);
    return TodoList;
  },

  update_todo: async ({ task_name, new_task }) => {
    const matchingTasks = await Todo.find({ task: new RegExp(task_name, "i") });

    if (matchingTasks.length === 0) {
      return { error: "No matching task found." };
    } else if (matchingTasks.length === 1) {
      matchingTasks[0].task = new_task;
      await matchingTasks[0].save();
      console.log("Updated Todo in DB:", matchingTasks[0]);
      return { message: `Updated task to: "${new_task}"` };
    } else {
      return {
        clarification_needed: true,
        message: "Multiple matching tasks found. Please specify which one:",
        options: matchingTasks.map(task => ({ id: task.id, task: task.task })),
      };
    }
  },

  delete_todo: async ({ task_name }) => {
    const matchingTasks = await Todo.find({ task: new RegExp(task_name, "i") });

    if (matchingTasks.length === 0) {
      return { error: "No matching task found." };
    } else if (matchingTasks.length === 1) {
      await Todo.findByIdAndDelete(matchingTasks[0]._id);
      console.log("Deleted Todo from DB:", matchingTasks[0]);
      return { message: `Deleted task: "${matchingTasks[0].task}"` };
    } else {
      return {
        clarification_needed: true,
        message: "Multiple matching tasks found. Please specify which one:",
        options: matchingTasks.map(task => ({ id: task.id, task: task.task })),
      };
    }
  },
};

// 🚀 **Gemini API Call with Chat Context**
async function processCommand(command) {
  const generativeModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-001",
    generationConfig: { 
      temperature: 0.5,
      maxOutputTokens: 500,
    },
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: { functionDeclarations: todoFunctionDeclarations },
  });

  const chatContext = chatHistory.map(
    (entry) => `User: ${entry.user}\nAI: ${entry.ai}`
  ).join("\n");

  const fullCommand = `Previous Conversations:\n${chatContext}\n\nUser: ${command}`;

  // console.log("Gemini API Request:", fullCommand);

  const chat = generativeModel.startChat();

  let attempt = 0;
  const maxRetries = 5;

  while (attempt < maxRetries) {
    try {
      const result = await chat.sendMessage(fullCommand);
      
      // console.log("Gemini API Response:", JSON.stringify(result, null, 2));

      if (result.response.functionCalls()?.length > 0) {
        const call = result.response.functionCalls()[0];
        const apiResponse = await functions[call.name](call.args);

        if (apiResponse.clarification_needed) {
          return apiResponse.message + "\n" + apiResponse.options.map(opt => `- ${opt.task}`).join("\n");
        }

        // console.log("API Response:", apiResponse);

        updateChatHistory(command, JSON.stringify(apiResponse));

        const result2 = await chat.sendMessage(JSON.stringify({
          functionsResponse: {
            name: call.name,
            response: apiResponse,
          },
        }));

        return result2.response.text();
      } else if (result.response.text()) {
        updateChatHistory(command, result.response.text());
        return result.response.text();
      } else {
        return "I didn't understand the command.";
      }

    } catch (error) {
      if (error.response?.status === 429) {
        attempt++;
        const retryAfter = error.response?.headers?.["retry-after"] || (2 ** attempt) * 1000; // Exponential backoff

        console.warn(`Rate limit exceeded (429). Retrying in ${retryAfter / 1000} seconds... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryAfter));
      } else {
        console.error("An error occurred:", error);
        return "An error occurred while processing your request. Please try again later.";
      }
    }
  }

  return "Too many requests. Please slow down and try again later.";
}


// ✅ **API Route to Handle User Commands**
app.post("/api/todo", async (req, res) => {
  const { command } = req.body;
  console.log(command);
  const response = await processCommand(command);
  console.log(response);
  res.json({ message: response });
});

// 🚀 **Start Server**
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
