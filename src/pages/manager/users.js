import React, { useState, useEffect, useCallback } from "react";
import Layout from "./Layout";
import { ClipLoader } from "react-spinners"; // Import spinner from react-spinners
import { getSession } from "next-auth/react";



function UsersPage({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    knowledgeArea: "",
    category: "",
    role: "employee",
  });
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [knowledgeAreas, setKnowledgeAreas] = useState([]);
  const [categories, setCategories] = useState([]);


  const fetchKnowledgeAreas = useCallback(async () => {
    const res = await fetch("/api/knowledgeAreas");
    const data = await res.json();
    if (data.success) {
      setKnowledgeAreas(data.data);
    }
  }, []); // No dependency needed
  
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const userKnowledgeAreas = user?.manageKnowledgeArea || [];
  
      const res = await fetch("/api/user");
      const data = await res.json();
  
      if (data.success) {
        const filtered = data.data.filter((fetchedUser) =>
          fetchedUser.knowledgeArea &&
          userKnowledgeAreas.some((area) =>
            fetchedUser.knowledgeArea.includes(area)
          )
        );
  
        setUsers(filtered);
        setFilteredUsers(filtered);
      }
    } catch (error) {
      console.error("Error fetching users:", error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.manageKnowledgeArea]);
  
  useEffect(() => {
    //if (user?.manageKnowledgeArea) {
      fetchUsers();
  //}
    fetchKnowledgeAreas();
  }, [fetchUsers, fetchKnowledgeAreas]);


  // Update categories when knowledgeArea changes
  useEffect(() => {
    if (form.knowledgeArea) {
      const selectedArea = knowledgeAreas.find(
        (area) => area.name === form.knowledgeArea
      );
      setCategories(selectedArea ? selectedArea.categories : []);
    } else {
      setCategories([]);
    }
  }, [form.knowledgeArea, knowledgeAreas]);


  // Function to handle search input change and filter users
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.knowledgeArea.toLowerCase().includes(query) ||
        user.category.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setForm({
      name: user.name,
      email: user.email,
      knowledgeArea: user.knowledgeArea,
      category: user.category,
      role: user.role,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser, ...form }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("User updated successfully");
        setEditingUser(null);
        setForm({
          name: "",
          email: "",
          knowledgeArea: "",
          category: "",
          role: "employee",
        });
        fetchUsers();
      } else {
        setMessage("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error.message);
      setMessage("An error occurred while updating the user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user}>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

        {message && <p className="text-green-600 mb-4">{message}</p>}

        {/* Search Bar */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name, email, or role"
            className="p-2 w-80 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Centered Loading Animation */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <ClipLoader size={50} color="#3498db" loading={loading} />
          </div>
        )}

        {/* User List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="border p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Knowledge Area:</strong> {user.knowledgeArea}
                </p>
                <p>
                  <strong>Category:</strong> {user.category}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
              </div>
              <button
                onClick={() => handleEdit(user)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Edit
              </button>

              {/* Conditionally render the edit form below the user row */}
              {editingUser === user._id && (
                <form onSubmit={handleUpdate} className="mt-4 p-4 border rounded-lg w-2/3">
                  <h2 className="text-xl font-bold mb-4">Edit User</h2>
                  <div className="mb-4">
                    <label className="block text-gray-700">Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Knowledge Area:</label>
                    <select
                      name="knowledgeArea"
                      value={form.knowledgeArea}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Knowledge Area</option>
                      {knowledgeAreas.map((area) => (
                        <option key={area._id} value={area.name}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                  <label className="block text-gray-700">Category:</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Role:</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="employee">Employee</option>
                      {/* <option value="admin">Admin</option> */}
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Save Changes
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}


// Protect the page with server-side authentication
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session || session.user.role !== "manager") {
    return {
      redirect: {
        destination: "/", // Replace with your sign-in page route
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user, // Pass user data to the component
    },
  };
}


export default UsersPage;
