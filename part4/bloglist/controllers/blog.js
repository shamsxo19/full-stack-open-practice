const blogsRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const user = await User.findOne({})

  const blog = new Blog({
    ...request.body,
    user: user._id
  })

  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true }
  )

  response.json(updatedBlog)
})

module.exports = blogsRouter