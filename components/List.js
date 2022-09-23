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