const express = require('express');
const menuitemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuitemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
	db.get('SELECT * FROM MenuItem WHERE id = $menuItemId', {
		$menuItemId: menuItemId
	}, (error, menuItem) => {
		if (error){
			next(error);
		}else if (menuItem){
			next();
		}else{
			res.sendStatus(404);
		}
	});
});

menuitemsRouter.get('/', (req, res, next) => {
	db.all('SELECT * FROM MenuItem WHERE menu_id = $menuId', {
		$menuId: req.params.menuId
	}, (error, menuItems) => {
		if (error){
			next(error);
		}else{
			res.send({menuItems: menuItems})
		}
	});
});

menuitemsRouter.post('/', (req, res, next) => {
	db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)', {
		$name: req.body.menuItem.name,
		$description: req.body.menuItem.description,
		$inventory: req.body.menuItem.inventory,
		$price: req.body.menuItem.price,
		$menuId: req.params.menuId
	}, function(error){
		if (error){
			res.sendStatus(400);
		}else{
			db.get('SELECT * FROM MenuItem WHERE id = $menuItemId', {
				$menuItemId: this.lastID
			}, (error, menuItem) => {
				if (error){
					next(error);
				}else{
					res.status(201).send({menuItem: menuItem});
				}
			})
		}
	});
});

menuitemsRouter.put('/:menuItemId', (req, res, next) => {
	db.run('UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $menuItemId', {
		$name: req.body.menuItem.name,
		$description: req.body.menuItem.description,
		$inventory: req.body.menuItem.inventory,
		$price: req.body.menuItem.price,
		$menuId: req.params.menuId,
		$menuItemId: req.params.menuItemId
	}, error => {
		if (error){
			res.sendStatus(400);
		}else{
			db.get('SELECT * FROM MenuItem WHERE id = $menuItemId', {
				$menuItemId: req.params.menuItemId
			}, (error, menuItem) => {
				if (error){
					next(error);
				}else{	
					res.send({menuItem: menuItem});
				}
			});
		}
	});
});

menuitemsRouter.delete('/:menuItemId', (req, res, next) => {
	db.run('DELETE FROM MenuItem WHERE id = $menuItemId', {
		$menuItemId: req.params.menuItemId
	}, error => {
		if (error){
			next(error);
		}else{
			res.status(204).send();
		}
	});
});

module.exports = menuitemsRouter;