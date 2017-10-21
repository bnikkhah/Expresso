const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
	db.get('SELECT * FROM Employee WHERE id = $employeeId', {
		$employeeId: employeeId
	}, (error, employee) => {
		if (error){
			next(error);
		}else if (employee){
			next();
		}else{
			res.sendStatus(404);
		}
	});
});

employeesRouter.get('/', (req, res, next) => {
	db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (error, employees) => {
		if (error){
			next(error);
		}else{
			res.send({employees: employees});
		}
	});
});

employeesRouter.get('/:employeeId', (req, res, next) => {
	db.get('SELECT * FROM Employee WHERE id = $employeeId', {
		$employeeId: req.params.employeeId
	}, (error, employee) => {
		if (error){
			next(error);
		}else if (!employee){
			res.status(404).send();
		}else{
			res.send({employee: employee});
		}
	});
});

employeesRouter.post('/', (req, res, next) => {
	db.run('INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, 1)', {
		$name: req.body.employee.name,
		$position: req.body.employee.position,
		$wage: req.body.employee.wage
	}, function(error){
		if (error){
			res.status(400).send();
		}else{
			db.get('SELECT * FROM Employee WHERE id = $employeeId', {
				$employeeId: this.lastID
			}, (error, employee) => {
				if (error){
					next(error);
				}else{
					res.status(201).send({employee: employee});
				}
			});
		}
	})
});

employeesRouter.put('/:employeeId', (req, res, next) => {
	db.run('UPDATE Employee SET name = $name, position = $position, wage = $wage', {
		$name: req.body.employee.name,
		$position: req.body.employee.position,
		$wage: req.body.employee.wage,
	}, error => {
		if (error){
			res.status(400).send();
		}else{
			db.get('SELECT * FROM Employee WHERE id = $employeeId', {
				$employeeId: req.params.employeeId
			}, (error, employee) => {
				if (error){
					next(error);
				}else{
					res.send({employee: employee});
				}
			});
		}
	})
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
	db.run('UPDATE Employee SET is_current_employee = 0 WHERE id = $employeeId', {
		$employeeId: req.params.employeeId
	}, error => {
		if (error){
			next(error);
		}else{
			db.get('SELECT * FROM Employee WHERE id = $employeeId', {
				$employeeId: req.params.employeeId
			}, (error, employee) => {
				if (error){
					next(error);
				}else{
					res.send({employee: employee});
				}
			});
		}
	});
});

module.exports = employeesRouter;