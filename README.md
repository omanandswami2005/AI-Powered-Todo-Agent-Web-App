# 🚀 AI-Powered To-Do & Chat Assistant  

An intelligent **AI assistant** that seamlessly **manages tasks** while also engaging users with **fun interactions, coding help, and general knowledge**.  

## 🎯 Features  

### ✅ To-Do Management  
- **Add Task** → `"Add 'Buy groceries' to my list."`  
- **View Tasks** → `"Show all my tasks."`  
- **Update Task** → `"Update my 'Workout' task to 'Yoga session'."`  
- **Delete Task** → `"Delete my 'Morning meeting' task."`  
- **Context Awareness** → Remembers the **last 5 interactions** for better responses.  
- **Clarification Handling** → If multiple tasks match, AI asks the user for selection.  

### 🎭 Fun & Informative Chat Mode  
- **Tell Jokes** → `"Tell me a joke."`  
- **Coding Help** → `"Write a Python function to reverse a string."`  
- **General Knowledge** → `"What’s the capital of Japan?"`  
- **Motivational Boost** → `"Give me a productivity tip!"`  

## 🛠️ Tech Stack  
- **Node.js** + **Express.js**  
- **MongoDB** + **Mongoose**  
- **Google Gemini AI (Function Calling)**  

## 🚀 How It Works  
1. **Detects User Intent** → Determines if the request is task-related or general chat.  
2. **Includes Last 5 Chats** → Uses past interactions for better context.  
3. **Smart Task Handling** → No need for task IDs, uses **fuzzy matching** and **clarifications**.  
4. **Interactive & Engaging** → Switches between To-Do Management and Chat Mode dynamically.  

## 📌 Example Usage  

### 🔹 Task Management  
```bash
User: "Add 'Finish report' to my list."
AI: "✅ Added 'Finish report' to your list."
User: "Delete my last task."
AI: "You mean 'Finish report'? ✅ Done!"
```

### 🔹 Fun Chat Mode  
```bash
User: "Tell me a joke."
AI: "Why did the computer go to therapy? It had too many bugs! 🐛😂"
User: "Write a Python function to reverse a string."
AI:
def reverse_string(s):
    return s[::-1]

print(reverse_string('hello'))  # Output: 'olleh'
```

## 🛠️ Setup & Installation  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/your-repo/ai-todo-chat-assistant.git
cd ai-todo-chat-assistant
```

### 2️⃣ Install Dependencies  
```bash
npm install
```

### 3️⃣ Set Up Environment Variables  
Create a `.env` file and add your **Google Gemini API Key & MongoDB Connection**  
```env
GEMINI_API_KEY=your_api_key_here
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

### 4️⃣ Run the Server  
```bash
node server.js
```

## 📌 Future Enhancements  
- **Voice Command Support**  
- **Multi-User Accounts & Authentication**  
- **Smart Task Prioritization**  

---

## 🔗 Contribute & Support  
Feel free to **fork**, **contribute**, or **suggest improvements!** 🚀  
📧 Contact: [omanandswami2005@gmail.com]  
---

### 📌 **Key Highlights of This README**
✅ **Well-structured** with clear sections.  
✅ **Uses Markdown formatting** for easy readability on GitHub.  
✅ **Includes Setup Instructions, Example Usage, and Contribution Info.**  
✅ **Looks professional and easy to follow!**  

Would you like any **modifications or additions**? 🚀
```
