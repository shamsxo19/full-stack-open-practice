const { test, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')

const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const blogs = [
  {
    title: "First blog",
    author: "Shams",
    url: "http://example.com/1",
    likes: 7
  },
  {
    title: "Second blog",
    author: "Sentry",
    url: "http://example.com/2",
    likes: 13
  }

]

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(blogs)
})

test('blogs are returned in correct amount as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, blogs.length)
})
test('blog posts have unique identifier property named id', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.ok(response.body[0].id)
  assert.strictEqual(response.body[0]._id, undefined)
})
test('a new blog can be added', async () => {
  const newBlog = {
    title: "Third blog",
    author: "Zaid",
    url: "http://example.com/3", 
    likes: 7 
  } 
 
  await api 
    .post('/api/blogs') 
    .send(newBlog) 
    .expect(201) 
    .expect('Content-Type', /application\/json/)
 
  const response = await api.get('/api/blogs') 
  const blogsAtEnd = response.body 
 
  assert.strictEqual(blogsAtEnd.length, blogs.length+1) 
 
  const titles = blogsAtEnd.map(b => b.title) 
  assert.ok(titles.includes('Third blog')) 
})

test('if likes property is missing, it is defaulted to 0', async () => {
  const newBlog = {
    title: "Blog without likes",
    author: "Farhan",
    url: "http://example.com/4"
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: "Neil",
    url: "http://example.com/5",
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send({ ...newBlog, title: undefined })
    .expect(400)
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: "Blog without url",
    author: "Felix",
    likes: 3
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToDelete = blogsAtStart[0]
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)
  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
  const ids = blogsAtEnd.map(b => b.id)
  assert(!ids.includes(blogToDelete.id))
})

test('a blog\'s likes can be updated', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToUpdate = blogsAtStart[0]

  const updatedBlog = {
    ...blogToUpdate.toJSON(),
    likes: blogToUpdate.likes + 1 
  }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await Blog.find({})
  const blogAfterUpdate = blogsAtEnd.find(
    blog => blog.id === blogToUpdate.id
  )

  assert.strictEqual(blogAfterUpdate.likes, blogToUpdate.likes + 1)
})
