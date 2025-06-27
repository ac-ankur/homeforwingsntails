import axios from "axios";
import React, { useEffect, useState } from "react";

function Practice() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

    const [addUser, setAddUser] = useState({
      name: "",
      email: "",
      role: "",
      status: "", 
    });
  useEffect(() => {
    fetchData();
  }, []);

  const indexOfLastItem=currentPage *itemsPerPage;
  const indexOfFirstItem=indexOfLastItem-itemsPerPage;
  const currentItems=data.slice(indexOfFirstItem,indexOfLastItem)
  const totalPages=Math.ceil(data.length/itemsPerPage)
  const handlePageChange=(page)=>{
    setCurrentPage(page);
  }
  const fetchData = async () => {
    try {
      const result = await axios.get("http://localhost:3001/users");
      console.log(result.data);
      setData(result.data);
      setSummary(result.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const addNewUser=async()=>{
    try {
        const result=await axios.post("http://localhost:3001/users",{
        name: addUser.name,
        email: addUser.email,
        role: addUser.role,
        status: addUser.status
        })
        console.log(result.data);
        fetchData();
    } catch (error) {
        console.error("Error adding new user:", error);
    }
  }
  const deleteUser=async (id)=>{
    try {
        const result=await axios.delete(`http://localhost:3001/users/${id}`);
        alert("User deleted successfully");
        fetchData(); 
    } catch (error) {
        console.error("Error deleting user:", error);   
    }
  }
  return (
    <div>
      <h1>Practice</h1>
      <br />
      <input value={addUser.name} onChange={(e)=>setAddUser({...addUser,name:e.target.value})}placeholder="Name"></input>
      <input value={addUser.email} onChange={(e)=>setAddUser({...addUser,email:e.target.value})} placeholder="Email"></input>
      <input value={addUser.role} onChange={(e)=>setAddUser({...addUser,role:e.target.value})} placeholder="Role"></input>
      <input value={addUser.status} onChange={(e)=>setAddUser({...addUser,status:e.target.value})} placeholder="Status"></input>
      <button style={{margin:'20px '}} onClick={addNewUser}>Add new user</button>

      <ul>
        <li>ID|Name|Email|Role|Status|Edit|Delete</li>
        {currentItems.map((item) => (
          <li key={item.id}>
            {item.id}|{item.name} | {item.email} | {item.role} |{item.status}|<button style={{margin:'5px'}} >Edit</button> | <button  style={{margin:'5px'}} onClick={()=>deleteUser(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        {Array.from({length:totalPages},(_,i)=>(
            <button key={i} onClick={()=>handlePageChange(i+1)} style={{margin:'5px'}}>
                {i+1}
            </button>
        ))}
      </div>
      {/* <h2>Total medicine:{summary.totalMedicines}</h2> */}
    </div>
  );
}

export default Practice;
