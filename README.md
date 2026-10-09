
# Budget Tracker - Full Stack Application

A complete full-stack budget tracking application built with **Spring Boot** (Backend) and **React** (Frontend).

## 🎯 Features

✅ **User Authentication** - Register & Login with JWT tokens  
✅ **Expense Management** - Add, view, edit, delete expenses  
✅ **Budget Tracking** - Set spending limits by category  
✅ **Analytics** - Pie charts (category breakdown) & line graphs (spending trends)  
✅ **Responsive UI** - Modern design with Tailwind CSS  
✅ **Real-time Sync** - All data persists to PostgreSQL  

---

## 🛠️ Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.5.14
- Spring Data JPA
- PostgreSQL
- JWT Authentication
- Lombok

**Frontend:**
- React 18
- React Router
- Tailwind CSS
- Axios
- Recharts (Charts)

---

## 📋 Prerequisites

Before running the app, install:

1. **Java 17+** - [Download JDK 17](https://www.oracle.com/java/technologies/downloads/#java17)
2. **PostgreSQL** - [Download PostgreSQL](https://www.postgresql.org/download/)
3. **Node.js** (v16+) - [Download Node.js](https://nodejs.org/)
4. **Git** - [Download Git](https://git-scm.com/downloads)
5. **Maven** - Usually included with Spring Boot, but can install separately

---

## 🚀 Quick Start (Local Setup)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Adiimar/budget-tracker.git
cd budget-tracker
```

### Step 2: Switch to Development Branch

```bash
git checkout full-stack-dev
```

### Step 3: Setup PostgreSQL Database

1. **Start PostgreSQL** (if not already running)
   - On Windows: Open pgAdmin or use Windows Services
   - On Mac: `brew services start postgresql`
   - On Linux: `sudo systemctl start postgresql`

2. **Create the database**:
   ```bash
   psql -U postgres
   ```
   Then in the PostgreSQL prompt:
   ```sql
   CREATE DATABASE budget_tracker;
   \q
   ```

3. **Verify connection** (optional - use a database client like pgAdmin or DBeaver)

---

### Step 4: Run the Backend (Spring Boot)

1. Open a terminal in the project root:
   ```bash
   cd budget-tracker  # (if not already there)
   ```

2. **Update database credentials** (if needed):
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/budget_tracker
   spring.datasource.username=postgres
   spring.datasource.password=YOUR_POSTGRES_PASSWORD  # Change this
   ```

3. **Build and run the backend**:
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```
   
   On Windows:
   ```bash
   mvnw.cmd clean install
   mvnw.cmd spring-boot:run
   ```

4. **Wait for startup message**:
   ```
   Started BudgetTrackerApplication in X.XXX seconds
   ```

   Backend is now running at **http://localhost:8080**

---

### Step 5: Run the Frontend (React)

1. **Open a new terminal** (keep the backend running)

2. Navigate to frontend:
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the React app**:
   ```bash
   npm start
   ```

5. **Wait for browser to open**:
   The app will automatically open at **http://localhost:3000**

---

## ✅ Verify Everything Works

1. **Register a new account**:
   - Go to http://localhost:3000/register
   - Create a test account
   - You should be redirected to the dashboard

2. **Add an expense**:
   - Click "+ Add Expense"
   - Fill in amount, category, description, date
   - Click "Add Expense"
   - Expense should appear in the list

3. **View charts**:
   - Charts show automatically once you have expenses
   - Pie chart shows breakdown by category
   - Line graph shows spending trend

4. **Set a budget**:
   - In the Budget Overview section, click "+ Add Budget"
   - Set a category and limit
   - Progress bar shows spending vs limit

5. **Logout**:
   - Click "Logout" in the top right
   - Should redirect to login page

---

## 🗂️ Project Structure

```
budget-tracker/
├── src/
│   ├── main/
│   │   ├── java/com/example/budgettracker/
│   │   │   ├── entity/           # User, Expense, Budget entities
│   │   │   ├── repository/        # Database repositories
│   │   │   ├── service/           # Business logic
│   │   │   ├── controller/        # REST API endpoints
│   │   │   ├── dto/               # Data transfer objects
│   │   │   ├── util/              # JWT utility
│   │   │   ├── config/            # Security configuration
│   │   │   └── BudgetTrackerApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── frontend/
│   ├── src/
│   │   ├── pages/         # Login, Register, Dashboard
│   │   ├── components/    # Reusable components
│   │   ├── api/           # API client
│   │   ├── App.jsx        # Main app component
│   │   └── index.js       # React entry point
│   ├── public/
│   └── package.json
├── pom.xml                # Maven dependencies
└── README.md              # This file
```

---

## 🌐 Deploying to Render (test setup)

The root `render.yaml` Blueprint creates a Spring Boot API, a React static site,
and a PostgreSQL database. To deploy it:

1. Push this project to a GitHub repository you control.
2. In Render, choose **New + → Blueprint**, connect the repository, and select
   its `render.yaml` file.
3. Review and apply the Blueprint. `JWT_SECRET` is generated by Render, and the
   database credentials are linked internally rather than stored in source.
4. Open the `budget-tracker-web` URL after both services finish deploying, then
   register a test account and verify login and saving data.

This Blueprint intentionally uses Render's **free PostgreSQL** for testing.
Render's free database is temporary and expires after 30 days; free web services
may also sleep while idle and take time to start. Do not store important or
financially sensitive data in this test deployment. Change the database to a
paid persistent plan before relying on it.

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all user expenses
- `GET /api/expenses/{id}` - Get single expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
- `GET /api/expenses/range` - Get expenses by date range

### Budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets` - Get all user budgets
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

---

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```
Error: Connection refused at localhost:5432
```
**Solution:**
- Make sure PostgreSQL is running
- Check database name: `budget_tracker`
- Verify username/password in `application.properties`
- Use `psql -U postgres` to test connection

### Port Already in Use (8080 or 3000)
```
Error: Port 8080 already in use
```
**Solution:**
- Kill the process using the port:
  - Windows: `netstat -ano | findstr :8080` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -i :8080` then `kill -9 <PID>`

### React App Won't Connect to Backend
```
Error: Failed to fetch / Network error
```
**Solution:**
- Ensure backend is running on port 8080
- Check browser console for CORS errors
- Verify `proxy` in `frontend/package.json` is set to `http://localhost:8080`

### Dependencies Won't Install
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Learning Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [JWT Guide](https://jwt.io)
- [Tailwind CSS](https://tailwindcss.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

## 🔒 Security Notes

⚠️ **For development only!**

In production, you should:
- Use environment variables for sensitive data (database password, JWT secret)
- Enable HTTPS
- Implement refresh tokens for JWT
- Add rate limiting
- Validate all inputs server-side
- Use a secrets manager

---

## 🎓 What You'll Learn

By exploring this codebase, you'll understand:
- ✅ Full-stack web application architecture
- ✅ Spring Boot REST API design
- ✅ JWT authentication & authorization
- ✅ React component lifecycle & state management
- ✅ Database design & relationships
- ✅ CORS & API communication
- ✅ Tailwind CSS for modern UI
- ✅ Data visualization with Recharts

---

## 📞 Support

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Review server/client console logs
3. Verify all prerequisites are installed
4. Make sure you're on the `full-stack-dev` branch

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🎉 Congratulations!

You now have a **fully functional full-stack budget tracker application**! 

**Next Steps:**
1. Explore the code to understand how it works
2. Try modifying features (add new categories, change styling)
3. Deploy to a cloud platform (Heroku, Railway, Render)
4. Add more features (recurring expenses, monthly reports, etc.)

Happy coding! 🚀
