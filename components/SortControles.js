import { useRouter } from "next/router";

function SortControles(){
  const router = useRouter()
  // retrieve sortOrder from query || set default 'asc'
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