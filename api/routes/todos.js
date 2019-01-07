const Koa = require('koa');
const Router = require('koa-router');
const serialize = require('serialize-javascript');

const { Todo } = require('../models/todos');
const mongoose = require('mongoose');

const bodyParser = require('koa-body');
const path = require('path');

const router = new Router({
    prefix: '/api/v1'
});

router.post('/upload', bodyParser({
        formidable: {
            uploadDir: 'uploads/',
            keepExtensions: true
        },
        multipart: true,
        strict: false,
        urlencoded: true
    }), async (ctx, next) => {
    ctx.body = serialize(ctx.request.files.uploadedImage);
});

router.get('/todos', async (ctx, next) => {
    const todos = await Todo.find().select('name text _id todoImage');
    const res = {
        items: todos,
        amount: todos.length
    }

    ctx.body = serialize(res, { space: 4 });
});

router.get('/todos/:todoId', async (ctx, next) => {
    const { todoId } = ctx.params;

    try {
        const todo = await Todo.findById(todoId).select('name text _id todoImage');

        if (todo) {
            ctx.body = serialize(todo, { space: 4 });
        } else {
            ctx.status = 404;
            ctx.body = serialize({
                message: 'No Todo found for provided ID'
            });
        }
    } catch (err) {
        ctx.body = `Some error happend... ${err}`;
    }
});

router.patch('/todos/:todoId', async (ctx, next) => {
    const { todoId } = ctx.params;

    try {
        const res = await Todo.findByIdAndUpdate(
            {
                _id: todoId
            },
            {
                $set: ctx.request.body
            }
        ).select('name text _id');;

        ctx.body = res;
    } catch (err) {
        ctx.body = err._message;
    }
});

router.del('/todos/:todoId', async (ctx, next) => {
    const { todoId } = ctx.params;

    try {
        const res = await Todo.findByIdAndDelete({
            _id: todoId
        });

        ctx.body = res;
    } catch (err) {
        ctx.body = err._message;
    }
});

router.post('/todos', bodyParser({
        formidable: {
            uploadDir: 'uploads/',
            keepExtensions: true
        },
        multipart: true,
        strict: false,
        urlencoded: true
    }), async (ctx, next) => {
        const todo = new Todo({
            name: ctx.request.body.name,
            text: ctx.request.body.text,
            todoImage: ctx.request.files.todoImage.path
        });

        try {
            const res = await todo.save();
            ctx.body = res;
        } catch (err) {
            ctx.status = err.status || 500;
            ctx.body = err.message;
        }
});

module.exports.router = router;
