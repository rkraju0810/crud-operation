import React, { useEffect, useState } from 'react';

const App = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newUser, setNewUser] = useState({id: String(users.length + 1), name: '', age: '', city: '' });
  const [editItems, setEditItems] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [error, setError] = useState('');

  const DATA_URL = 'http://localhost:3500/users';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(DATA_URL);
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const addNewRecord = () => {
    setNewUser({name: '', age: '', city: '' });
    setEditItems(false);
    setIsModelOpen(true);
  };

  const handleEdit = (user) => {
    setNewUser({ ...user, id: String(user.id) });
    setEditItems(true);
    setIsModelOpen(true);
  };

  const handleDelete = async (id) => {
    console.log('Attempting to delete user with ID:', id);
    console.log('Full URL:', `${DATA_URL}/${id}`);
    const stringId = String(id); // Convert to string
    try {
        const deleteOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(`${DATA_URL}/${stringId}`, deleteOptions);
        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            throw new Error('Failed to delete user');
        }

   
        const updatedUsers = users.filter((user) => user.id !== id);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        console.log('User successfully deleted from server and UI updated');
    } catch (error) {
        console.error('Error in handleDelete:', error.message);
    }
};





  const handleData = (e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newUser.name || !newUser.age || !newUser.city) {
        setError('All fields are required.');
        return;
    }

    setError(''); 

    try {
        if (!editItems) {
            const postOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            };
            const response = await fetch(DATA_URL, postOptions);
            if (!response.ok) throw new Error('Failed to add new user');

            const createdUser = await response.json();
            setUsers([...users, createdUser]);
            setFilteredUsers([...filteredUsers, createdUser]);

        } else {
            const patchOptions = {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            };

            const response = await fetch(`${DATA_URL}/${newUser.id}`, patchOptions);
            if (!response.ok) throw new Error('Failed to update user');

            const updatedUser = await response.json();

            const updatedUsers = users.map((user) =>
                user.id === updatedUser.id ? updatedUser : user
            );
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        setIsModelOpen(false);
        setEditItems(false);
    }
};



  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl text-center font-semibold mb-4">CRUD Application</h3>
        <div className="flex mb-6">
          <input
            type="text"
            placeholder="Search"
            onChange={handleChange}
            className="flex-1 p-2 border border-gray-300 rounded-l-md"
          />
          <button
            onClick={addNewRecord}
            className="bg-green-500 text-white px-4 py-2 rounded-r-md hover:bg-green-600"
          >
            Add
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">SI.NO</th>
                <th className="py-2 px-4 border-b">NAME</th>
                <th className="py-2 px-4 border-b">AGE</th>
                <th className="py-2 px-4 border-b">CITY</th>
                <th className="py-2 px-4 border-b">EDIT</th>
                <th className="py-2 px-4 border-b">DELETE</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers &&
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                    <td className="py-2 px-4 border-b text-center">{user.name}</td>
                    <td className="py-2 px-4 border-b text-center">{user.age}</td>
                    <td className="py-2 px-4 border-b text-center">{user.city}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {isModelOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-md w-1/2 relative">
              <span
                className="absolute top-2 right-2 text-2xl cursor-pointer"
                onClick={() => setIsModelOpen(false)}
              >
                &times;
              </span>
              <h3 className="text-xl font-semibold mb-4">
                {editItems ? 'Edit User' : 'Add New User'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name:
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleData}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                    Age:
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={newUser.age}
                    onChange={handleData}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City:
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={newUser.city}
                    onChange={handleData}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
