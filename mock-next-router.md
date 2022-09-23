# How to mock Next router with Jest

I will start off with a quick snippet for the people only looking for that. I give a long explanation including examples and tests after.

## tl;dr

```javascript
// mock useRouter
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// setup a new mocking function for push method
const pushMock = jest.fn()

// mock a return value on useRouter
useRouter.mockReturnValue({
  query: {},
  // return mock for push method
  push: pushMock,
  // ... add the props or methods you need
})
```

## The example

To demonstrate how to mock `next/router` I will use an example. The example files and tests are available on [github](https://github.com/peterlidee/mock-next-router) and are build on create-next-app. So you can just run `npm run dev` to run the example or `npm run test` to run the test files.

This is what we will build:

// image

We have a list of 3 fruits that can be sorted. We control the sort order (ascending or descending) by selecting a radio input.

This little project relies on url query parameters. For example, selecting 'sort descending' will trigger a `router.push` to `http://localhost:3000/?sortOrder=desc`. We have a component `List` that reads this query parameter and sorts the list accordingly. The second component `SortControles` renders the radio inputs.

```jsx
// components/List.js
import { useRouter } from 'next/router'

function List(){
  const list = ['Cherry', 'Apple', 'Banana']
  
  const router = useRouter()
  // read sortOrder from query || set default 'asc'
  const sortOrder = (router.query.hasOwnProperty('sortOrder')) ? router.query.sortOrder : 'asc'
  
  // sort the items by sortOrder
  const sortedList = [...list].sort((a,b) => {
    if(sortOrder == 'desc') return a > b ? -1 : 1
    return a < b ? -1 : 1
  })

  return(
    <ul>
      {sortedList.map(item => <li key={item}>{item}</li>)}
    </ul>
  )
}

export default List
```

This should be pretty straightforward. We read `sortOrder` from the url query and sort the list accordingly. When there is no `sortOrder` query, we use a default 'asc' value.

```jsx
// components/SortControles.js
import { useRouter } from "next/router";

function SortControles(){
  const router = useRouter()
  // read sortOrder from query || set default 'asc'
  const sortOrder = router.query.hasOwnProperty('sortOrder') ? router.query.sortOrder : 'asc'

  const handleChange = (e) => {
    router.push({
      pathname: '/',
      query: { sortOrder: e.target.value }
    })
  }

  return(
    <>
      <label>
        <input
          type="radio"
          name="sortOrder"
          value="asc"
          checked={sortOrder === 'asc'}
          onChange={(e) => handleChange(e)}
        />
        sort ascending
      </label>
      <label>
        <input
          type="radio"
          name="sortOrder"
          value="desc"
          checked={sortOrder === 'desc'}
          onChange={(e) => handleChange(e)}
        />
        sort descending
      </label>
    </>
  )
}

export default SortControles
```

In `SortControles` we again retrieve `sortOrder` from query or set a default of 'asc'. We render out 2 radio inputs: 'sort ascending' and 'sort descending'. We determine which one is checked and we add a handler. This handler pushes a query (sortOrder 'asc' or 'desc') to router.

This should be clear. Note that I intentionally used radio inputs so I could mock `router.push` in testing this component.

There is a second sidenote. This is not relevant to mocking next router so you can skip this note if you want. When using `SSG` + `router.query` you run into a problem that I solved in `page/index.js`.

---- begin sidenote ----

```jsx
// pages/index.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import List from '../components/List'
import SortControles from '../components/SortControles'

export default function Home(){
  const [routerReady, setRouterReady] = useState(false)
  const router = useRouter()
  useEffect(() => {
    if(router.isReady){
      setRouterReady(true)
    }
  }, [router.isReady])

  if(!routerReady) return null

  return( 
    <>
      <SortControles />
      <List />
    </>
  )
}
```

I'm using a default `static site generation` (SSG) `Next` build. This causes a little problem, namely the query element on the router will be empty on first render. Only after hydration will it be populated with the query actually present in the url. This is normal behaviour [docs](https://nextjs.org/docs/api-reference/next/router#router-object).

In our case however it has an undesired side effect. If we load the url `http://localhost:3000/?sortOrder=desc` then at first render (before hydration), the query will be empty. As you saw in the files, we provide a default asc value when there is no query. So on first render, the list will be sorted ascending. Then the app gets hydrated and it rerenders the list in descending order. In other words, there will be a flash from ascending to descending. And we don't want that.

To solve this, we used the code above. We set state `routerReady` to false. While `routerReady` is false, we don't render anything. Meanwhile in `useEffect()` we listen for the `isReady` prop on the router. This is set to true after hydration. When it's true, we set state `routerReady` to true and the components render.

I looks quite complicated but we just wait for hydration to give us access to router.query. Before that we don't render anything. Because our components `List` and `SortControles` are only rendered when `router.isReady`, we don't have to worry about this in those components.

This was just a sidenote in case you were wondering about the `page/index.js` file and the empty query on first render.

---- end sidenote ----

## Testing

We will now do the actual testing and mocking. We start with testing `List`. 

### Testing List

If we simply render list in a test file, the test will fail to run because we don't have access to router. So, we have to mock `Next` router. This is easy:

```javascript
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))
```

We mock the named export `useRouter`. More info on mocking named or default exports can be found in [another article](https://dev.to/peterlidee/returning-values-from-mocks-jest-mocking-react-part-3-3lfn) I wrote.

But, this won't suffice. Remember that we need the query object on `useRouter` and that doesn't exist since we just mocked `useRouter`. So we need to add a return value to our mock. (Again, read here how to [add return values to mocks](https://dev.to/peterlidee/returning-values-from-mocks-jest-mocking-react-part-3-3lfn)). So, let's add a return value:

```javascript
useRouter.mockReturnValue({ query: {}})
```
And that's it. We now have a `useRouter` mock that has a query property. Let's look at the first test for `List`:

```javascript
// components/__test__/List.test.js

import { screen, render } from '@testing-library/react'
import { toHaveTextContent } from '@testing-library/jest-dom'

import { useRouter } from 'next/router'
import List from '../List'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

test('List renders with an empty query', () => {
  useRouter.mockReturnValue({ query: {}})
  render(<List />)
  const listItems = screen.getAllByRole('listitem')
  expect(listItems[0]).toHaveTextContent('Apple')
  expect(listItems[1]).toHaveTextContent('Banana')
  expect(listItems[2]).toHaveTextContent('Cherry')
})
```

A breakdown of the test: first we add a return value to our `useRouter` mock. What did we return? An object with a query property. The value of this property is an empty object.

When `List` renders, it receives this empty object and it will fallback to the default 'asc' value. So, it renders the list ascending: 'Apple', 'Banana', 'Cherry'. And that is what we tested.

Let's look at the other tests for `List`:

```javascript
// components/__test__/List.test.js

test('It renders correctly with query sortOrder=asc', () => {
  useRouter.mockReturnValue({ query: { sortOrder: 'asc' }})
  render(<List />)
  const listItems = screen.getAllByRole('listitem')
  expect(listItems[0]).toHaveTextContent('Apple')
  expect(listItems[1]).toHaveTextContent('Banana')
  expect(listItems[2]).toHaveTextContent('Cherry')
})

test('It renders correctly with query sortOrder=desc', () => {
  useRouter.mockReturnValue({ query: { sortOrder: 'desc' }})
  render(<List />)
  const listItems = screen.getAllByRole('listitem')
  expect(listItems[2]).toHaveTextContent('Apple')
  expect(listItems[1]).toHaveTextContent('Banana')
  expect(listItems[0]).toHaveTextContent('Cherry')
})
```

These should make sense. We mocked a return value of sortOrder 'asc' and then 'desc' and then checked the order of the list. And that's the end of testing `List`.

### Testing SortControles

`SortControles` also uses the query property and we now know how to mock that. But, on top of that, it uses the push method on `useRouter`. This is how we mock that:

```javascript
// mock useRouter
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// add return value query and push
useRouter.mockReturnValue({
  query: {},
  push: () => {}
})
```

Let's first take a look at our test file:

```javascript
// components/__test__/SortControles.js

import { screen, render } from '@testing-library/react'
import { toBeInTheDocument } from '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import SortControles from '../SortControles'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

function setupRender(){
  render(<SortControles />)
  const radioAsc = screen.getByRole('radio', { name: /sort ascending/i })
  const radioDesc = screen.getByRole('radio', { name: /sort descending/i })
  return {
    radioAsc,
    radioDesc
  }
}

describe('components/SortControles', () => {
  // tests here
})
```

A breakdown: we first have our imports and mock of `useRouter`. Then I use this setup function.

```javascript
function setupRender(){
  render(<SortControles />)
  const radioAsc = screen.getByRole('radio', { name: /sort ascending/i })
  const radioDesc = screen.getByRole('radio', { name: /sort descending/i })
  return {
    radioAsc,
    radioDesc
  }
}
```

I run different tests and in each test I have to make the same queries to the radio inputs. So, instead having to rewrite these queries over and over I wrote this setup function:

1. It makes the render
2. It makes the queries
3. It returns these queries

To setup our test I simply call the function and catch the return value:

```javascript
const { radioAsc, radioDesc } = setupRender()
```

This renders the component and gives me the elements I want to test. Nice and simple. On to the actual tests. We test 3 situation: `query: {}`, `query: {sortOrder: 'asc'}` and `query: {sortOrder: 'desc'}`

```javascript
// components/__test__/SortControles.js

test('It renders with an empty query', () => {
  useRouter.mockReturnValue({
    query: {},
    push: () => {}
  })
  const { radioAsc, radioDesc } = setupRender()

  expect(radioAsc).toBeInTheDocument()
  expect(radioAsc).toBeChecked()
  expect(radioDesc).toBeInTheDocument()
  expect(radioDesc).not.toBeChecked()
})

test('It renders with a query sortOrder=asc', () => {
  useRouter.mockReturnValue({
    query: { sortOrder: 'asc' },
    push: () => {}
  })
  const { radioAsc, radioDesc } = setupRender()

  expect(radioAsc).toBeChecked()
  expect(radioDesc).not.toBeChecked()
})

test('It renders with a query sortOrder=desc', () => {
  useRouter.mockReturnValue({
    query: { sortOrder: 'desc' },
    push: () => {}
  })
  const { radioAsc, radioDesc } = setupRender()

  expect(radioAsc).not.toBeChecked()
  expect(radioDesc).toBeChecked()
})
```
These tests should be clear. We expect the radio input corresponding to the query to be checked.

Our next tests on `SortControles` have `user events`. We want to see if clicks on the radio inputs are correctly caught. But how? In the `SortControles` component, clicks on the radios trigger a `router.push`. We returned the push method from out mock: 

```javascript
useRouter.mockReturnValue({
  push: () => {}
})
```

But, we can't test this method. For example, this is impossible:

```javascript
// error, push is not defined
expect(push).toHaveBeenCalled()
// error, Received has value: undefined
expect(useRouter.push).toHaveBeenCalled()
```

We need push to be a mock function. Let's do that:

```javascript
// mock useRouter
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))
// make a mock function
const pushMock = jest.fn()
// return a value from useRouter mock
useRouter.mockReturnValue({
  push: pushMock
})
```

And that's all. We now have a mock for push that we can access:

```javascript
expect(pushMock).toHaveBeenCalled()
```

Let's see the last 2 tests:

```javascript
// components/__test__/SortControles.js

// on top of the page we added the pushMock
const pushMock = jest.fn()

// more tests
test('It calls router.push with the correct arguments when clicking desc radio', async() => {
  const user = userEvent.setup()
  useRouter.mockReturnValue({
    query: { sortOrder: 'asc' },
    push: pushMock,
  })
  const { radioDesc } = setupRender()

  await user.click(radioDesc)
  expect(pushMock).toHaveBeenCalledWith( expect.objectContaining({
    query: { sortOrder: 'desc' }
  }))
})

test('It calls router.push with the correct arguments when clicking asc radio', async() => {
  const user = userEvent.setup()
  useRouter.mockReturnValue({
    query: { sortOrder: 'desc' },
    push: pushMock,
  })
  const { radioAsc } = setupRender()
  
  await user.click(radioAsc)
  expect(pushMock).toHaveBeenCalledWith( expect.objectContaining({
    query: { sortOrder: 'asc' }
  }))
})
```

In these last 2 tests, the `useRouter` mocks return an object with 2 properties: our push method now with the `pushMock` and a query with `sortOrder: 'asc'`  in the first and `sortOrder: 'desc'` in the second. We simulate a click and then test what the handler - `pushMock` - was called with.

## Summary

To mock `useRouter` we start of by mocking it as a named import:

```javascript
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))
```

We have now mocked `useRouter` but this mock is useless because in our components `useRouter` is used, for example using the `push()` method or reading the `query` property.

So, to make our `useRouter` mock usefull, we need to have `useRouter` return something. We return the methods or properties we need. In the above examples we used:

```javascript
useRouter.mockReturnValue({
  query: {},
  push: () => {}
})
```

To actually test the push method, simply adding a dummy function won't suffice. So we make a new mocking function and set that up as our push method.

```javascript
const pushMock = jest.fn()

useRouter.mockReturnValue({
  query: {},
  push: pushMock
})
```

Now, we can call `Jest` helper functions like `toHaveBeenCalled` on the `pushMock`. And that is all there is to it.

When testing your own components, you will probably need other `useRouter` properties or methods. You should now be able to set these up for yourself.

Hoped you learned something and good testing!