// mocking HTTP requests
// 💯 test the unhappy path
// http://localhost:3000/login-submission

import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {build, fake} from '@jackfranklin/test-data-bot'
import {setupServer} from 'msw/node'
import {handlers} from 'test/server-handlers'
import Login from '../../components/login-submission'

const buildLoginForm = build({
  fields: {
    username: fake(f => f.internet.userName()),
    password: fake(f => f.internet.password()),
  },
})

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterAll(() => server.close())

test(`logging in displays the user's username`, async () => {
  render(<Login />)
  const {username, password} = buildLoginForm()

  userEvent.type(screen.getByLabelText(/username/i), username)
  userEvent.type(screen.getByLabelText(/password/i), password)
  userEvent.click(screen.getByRole('button', {name: /submit/i}))

  expect(await screen.findByLabelText(/loading/i)).toBeInTheDocument()

  expect(await screen.findByText(username)).toBeInTheDocument()
  expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument()
})

test('omitting the password results in an error', async () => {
  render(<Login />)
  const {username} = buildLoginForm()

  userEvent.type(screen.getByLabelText(/username/i), username)
  // don't type in the password
  userEvent.click(screen.getByRole('button', {name: /submit/i}))

  expect(await screen.findByLabelText(/loading/i)).toBeInTheDocument()

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'password required',
  )
  expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument()
})