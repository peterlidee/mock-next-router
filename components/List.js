import { useRouter } from 'next/router'

function List(){
  
  const list = ['Cherry', 'Apple', 'Banana']
  
  const router = useRouter()
  // get sortOrder from query or set 'asc' as default when no query available
  let sortOrder = (router.query.hasOwnProperty('sortOrder')) ? router.query.sortOrder : 'asc'
  
  // sort the items by sortOrder
  const sortedList = [...list].sort((a,b) => {
    if(sortOrder == 'asc') return a > b ? 1 : -1
    return a < b ? 1 : -1
  })

  return(
    <ul>
      {sortedList.map(item => {
        return <li key={item}>{item}</li>
      })}
    </ul>
  )
}

export default List