import React from "react";

export interface AddUserFormProps {
  user: { name: string; phone: string; email: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit:(e:React.FormEvent<HTMLFormElement>)=>void;
}

const AddUserForm = ({ user,handleChange,onSubmit }: AddUserFormProps) => {
  return (
    <div>
      <form onSubmit={onSubmit}>
        <label htmlFor="name">Name</label>
        <input value={user.name} onChange={handleChange} id="name" name="name" onClick={() => {}}></input>
        <label htmlFor="email">Email</label>
        <input value={user.email} onChange={handleChange} id="email" name="email" onClick={() => {}}></input>
        <label htmlFor="phone">Phone</label>
        <input value={user.phone} onChange={handleChange} id="phone" name="phone" onClick={() => {}}></input>
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AddUserForm;
