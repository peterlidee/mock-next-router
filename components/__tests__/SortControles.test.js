import { screen, render } from '@testing-library/react'
import { toBeInTheDocument } from '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { useRouter } from 'next/router'
import SortControles from '../SortControles'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))
const pushMock = jest.fn()

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

})