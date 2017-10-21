const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuitemsRouter = require('./menu-items');
menusRouter.use('/:menuId/menu-items', menuitemsRouter);

menusRouter.param('menuId', (req, res, next, menuId) => {
	db.get('SELECT * FROM Menu WHERE id = $menuId', {
		$menuId: menuId
	}, (error, menu) => {
		if (error){
			next(error);
		}else if (menu){
			next();
		}else{
			res.sendStatus(404);
		}
	});
});

menusRouter.get('/', (req, res, next) => {
	db.all('SELECT * FROM Menu', (error, menus) => {
		if (error){
			next(error);
		}else{
			res.send({menus: menus});
		}
	})
});

menusRouter.get('/:menuId', (req, res, next) => {
	db.get('SELECT * FROM Menu WHERE id = $menuId', {
		$menuId: req.params.menuId
	}, (error, menu) => {
		if (error){
			next(error);
		}else{
			res.send({menu: menu});
		}
	});
});

menusRouter.post('/', (req, res, next) => {
	db.run('INSERT INTO Menu (title) VALUES ($title)', {
		$title: req.body.menu.title
	}, function(error){
		if (error){
			res.sendStatus(400);
		}else{
			db.get('SELECT * FROM Menu WHERE id = $menuId', {
				$menuId: this.lastID
			}, (error, menu) => {
				if (error){
					next(error);
				}else{
					res.status(201).send({menu: menu});
				}
			}); 
		}
	});
});

menusRouter.put('/:menuId', (req, res, next) => {
	db.run('UPDATE Menu SET title = $title', {
		$title: req.body.menu.title
	}, error => {
		if (error){
			res.sendStatus(400);
		}else{
			db.get('SELECT * FROM Menu WHERE id = $menuId', {
				$menuId: req.params.menuId
			}, (error, menu) => {
				if (error){
					next(error);
				}else{
					res.send({menu: menu});
				}
			});
		}
	});
});

menusRouter.delete('/:menuId', (req, res, next) => {
	db.get('SELECT * FROM MenuItem WHERE menu_id = $menuId', {
		$menuId: req.params.menuId
	}, (error, menuItem) => {
		if (error){
			next(error);
		}else if (menuItem){
			res.sendStatus(400);
		}else{
			db.run('DELETE FROM Menu WHERE id = $menuId', {
				$menuId: req.params.menuId
			}, error => {
				if (error){
					next(error);
				}else{
					res.status(204).send();
				}
			});
		}
	});
});

module.exports = menusRouter;