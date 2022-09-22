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