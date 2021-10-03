import React, { useState,useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_USERS } from "./graphQl/getAllUsers";
import { CREATE_USER } from "./graphQl/createUser";
import { SUBSCRIBE_USER } from "./graphQl/subscribeUser";
import AddUserForm from "./forms/addUser";

const initialState = {
  name: "",
  phone: "",
  email: "",
};
const Test = () => {
  const [user, setUser] = useState(initialState);
  const { data, loading,subscribeToMore,error } = useQuery(GET_ALL_USERS);
  useEffect(()=> subscribeToMore({
    document:SUBSCRIBE_USER,
    updateQuery:(prev,{subscriptionData}) => {
      if(!subscriptionData.data) return prev
      const newUser = subscriptionData.data.newUser
      console.log(newUser)
      return {
        getAllUsers:[...prev.getAllUsers,newUser]
      }
    }
  }),[subscribeToMore])
  const [newUser] = useMutation(CREATE_USER);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    newUser({
      variables: {
        input: user,
      },
    })
      .then((data) =>console.log(data))
      .catch((error) => console.log(error));
    setUser(initialState);
  };
  return (
    <div>
      <h1>All users</h1>
      {loading && <p>Loading...</p>}
      {!loading && data?.getAllUsers && (
        <ul>
          {data.getAllUsers.map(
            (
              user: { name: string; email: string; phone: string },
              idx: string
            ) => (
              <li key={idx}>
                <p>{user.name}</p>
                <p>{user.phone}</p>
              </li>
            )
          )}
        </ul>
      )}
      <AddUserForm
        user={user}
        handleChange={handleChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default Test;
