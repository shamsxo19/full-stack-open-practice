const Header = ({heading:{name}})=>{
  return(
  <h1>
    {name}
  </h1>
  )
}
const Parts = (props)=>{
  return(
      <p>
        {props.p} {props.e}
      </p> 
  )
}
const Content = ({p})=>{
return(
  <>
    {p.parts.map(part => (
      <Parts key={part.id} p={part.name} e={part.exercises} />
    ))}
  </>
)
}
const Total = ({e})=>{
  const total = e.parts.reduce((sum, part) => sum + part.exercises, 0)
  return (
    <b>Number of exercises {total}</b>
  )
}
const Course = ({courses})=>{
  return(
  <>
  {courses.map(course=> (
    <div key={course.id}>
    <Header heading= {course}/>
     <Content  p= {course}/>
     <Total  e= {course}/>
    </div>
  ))}
  </>
  )
}
export default Course