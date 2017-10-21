const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
	db.get('SELECT * FROM Timesheet WHERE id = $timesheetId', {
		$timesheetId: timesheetId
	}, (error, timesheet) => {
		if (error){
			next(error);
		}else if (timesheet){
			next();
		}else{
			res.sendStatus(404);
		}
	});
});

timesheetsRouter.get('/', (req, res, next) => {
	db.all('SELECT * FROM Timesheet WHERE employee_id = $employeeId', {
		$employeeId: req.params.employeeId
	}, (error, timesheets) => {
		if (error){
			next(error);
		}else{
			res.send({timesheets: timesheets});
		}
	});
});

timesheetsRouter.post('/', (req, res, next) => {
	db.run('INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)', {
		$hours: req.body.timesheet.hours,
		$rate: req.body.timesheet.rate,
		$date: req.body.timesheet.date,
		$employeeId: req.params.employeeId
	}, function(error){
		if (error){
			res.sendStatus(400);
		}else{
			db.get('SELECT * FROM Timesheet WHERE id = $employeeId', {
				$employeeId: this.lastID
			}, (error, timesheet) => {
				if (error){
					next(error);
				}else{
					res.status(201).send({timesheet: timesheet});
				}
			});
		}
	});
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
	db.run('UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $timesheetId', {
		$hours: req.body.timesheet.hours,
		$rate: req.body.timesheet.rate,
		$date: req.body.timesheet.date,
		$employeeId: req.params.employeeId,
		$timesheetId: req.params.timesheetId
	}, error => {
		if (error){
			res.sendStatus(400);
		}else{
			db.get('SELECT * FROM Timesheet WHERE id = $timesheetId', {
				$timesheetId: req.params.timesheetId
			}, (error, timesheet) => {
				if (error){
					next(error);
				}else{
					res.send({timesheet: timesheet});
				}
			});
		}
	})
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
	db.run('DELETE FROM Timesheet WHERE id = $timesheetId', {
		$timesheetId: req.params.timesheetId
	}, error => {
		if (error){
			next(error);
		}else{
			res.status(204).send();
		}
	});
});

module.exports = timesheetsRouter;