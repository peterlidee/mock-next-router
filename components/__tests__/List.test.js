import { screen, render } from '@testing-library/react'
import { toHaveTextContent } from '@testing-library/jest-dom'

import { useRouter } from 'next/router'
import List from '../List'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('components/List', () => {

  test('It renders with an empty query', () => {
    useRouter.mockReturnValue({ query: {}})
    render(<List />)
    const listItems = screen.getAllByRole('listitem')
    expect(listItems[0]).toHaveTextContent('Apple')
    expect(listItems[1]).toHaveTextContent('Banana')
    expect(listItems[2]).toHaveTextContent('Cherry')
  })

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

})