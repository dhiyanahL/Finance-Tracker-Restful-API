## Setting up the project :-

1. git clone 

2. install dependencies - npm install

3. run the server - npm run dev


## API End Points :-

1. Users - http://localhost:5000/api/users
2. Transactions - http://localhost:5000/api/transactions
3. Budgets - http://localhost:5000/api/budgets
4. Goals - http://localhost:5000/api/goals
5. Notifications - http://localhost:5000/api/notifications
6. Reports - http://localhost:5000/api/reports
7. Dashboard - http://localhost:5000/api/dashboard

## Running Tests

### Unit Tests (Jest) :-

 1. navigate to backend/tests/unit 
 2. npx jest updateGoal.test.js or npx jest getBudget.test.js or npx jest updateGoal.test.js

### Performance Test (Artillery):-

1. navigate to backend/tests/performance
2. artillery run performance-test.yml

### Integration Test (Supertest) :-

1. navigate to backend folder
2. npm test tests/integration/budgetandtransaction.test.js

For the integration test, a separate .env.test file is created with test env variables

### Security Testing (Burp Suite) :-

A screenshot is attached in the backend/tests/security folder




