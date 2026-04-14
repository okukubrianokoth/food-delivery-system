import { useEffect, useState } from "react";
import { getAllFoods, createFood, updateFood, deleteFood } from "../services/foodService";
import axios from 'axios';

const Admin = () => {
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [imageInputMethod, setImageInputMethod] = useState("file"); // "file" or "url"
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    shortDescription: "",
    description: "",
    image: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [validatingUrl, setValidatingUrl] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchFoods = async () => {
    const data = await getAllFoods();
    setFoods(data);
  };
  const fetchOrders = async () => {
    const { data } = await axios.get('/api/orders/all');
    setOrders(data);
  };

  const fetchUsers = async () => {
    const { data } = await axios.get('/api/auth/users');
    setUsers(data);
  };

  useEffect(() => {
    fetchFoods();
    fetchOrders();
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleValidateUrl = async () => {
    if (!imageUrl.trim()) {
      alert("Please enter an image URL");
      return;
    }

    setValidatingUrl(true);
    try {
      const { data } = await axios.post("/api/foods/validate-url", { imageUrl }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setFormData({ ...formData, image: data.imageUrl });
      alert("Image URL validated successfully!");
    } catch (error) {
      console.error("URL validation failed:", error);
      alert(error.response?.data?.message || "Image URL validation failed. Please check the URL.");
    } finally {
      setValidatingUrl(false);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      alert("Please select an image file first");
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("image", selectedFile);

    try {
      const { data } = await axios.post("/api/foods/upload", formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFormData({ ...formData, image: data.imageUrl });
      setSelectedFile(null);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.response?.data?.message || "Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.image) {
      alert("Please upload or validate an image first");
      return;
    }
    if (!formData.name || !formData.price || !formData.description) {
      alert("Please fill in all required fields (Name, Price, Description)");
      return;
    }

    try {
      if (isEditing) {
        // Update existing food
        await updateFood(editingId, formData);
        alert("Food item updated successfully!");
      } else {
        // Create new food
        const foodData = {
          ...formData,
          price: parseFloat(formData.price),
          countInStock: formData.countInStock ? parseInt(formData.countInStock) : 0,
        };
        await createFood(foodData);
        alert("Food item added successfully!");
      }
      fetchFoods();
      handleCancelEdit(); // Reset form after success
    } catch (error) {
      console.error("Error saving food:", error);
      alert(error.response?.data?.message || "Failed to save food item. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    await deleteFood(id);
    fetchFoods();
  };

  const handleEdit = (food) => {
    setFormData({
      name: food.name,
      price: food.price,
      shortDescription: food.shortDescription || "",
      description: food.description,
      image: food.image,
    });
    setImageUrl("");
    setSelectedFile(null);
    setIsEditing(true);
    setEditingId(food._id);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: "",
      price: "",
      shortDescription: "",
      description: "",
      image: "",
    });
    setImageUrl("");
    setSelectedFile(null);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleUpdateStatus = async (id, status) => {
    await axios.put(`/api/orders/${id}`, { status });
    fetchOrders();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <div className="mb-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Food Item" : "Manage Menu"}</h2>
        
        {/* Image Upload Section */}
        <div className="mb-4 p-4 bg-white rounded border">
          <h3 className="font-semibold mb-4">Add Food Image</h3>
          
          {/* Toggle between File Upload and URL Input */}
          <div className="flex gap-4 mb-4 border-b pb-3">
            <button
              onClick={() => {
                setImageInputMethod("file");
                setImageUrl("");
              }}
              className={`px-4 py-2 rounded font-medium transition ${
                imageInputMethod === "file"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📤 Upload From File
            </button>
            <button
              onClick={() => {
                setImageInputMethod("url");
                setSelectedFile(null);
              }}
              className={`px-4 py-2 rounded font-medium transition ${
                imageInputMethod === "url"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🔗 Use Image URL
            </button>
          </div>

          {/* File Upload Method */}
          {imageInputMethod === "file" && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Upload image from your computer (max 5MB)</p>
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border p-2 flex-1 rounded"
                />
                <button
                  onClick={handleUploadImage}
                  disabled={uploading || !selectedFile}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 hover:bg-blue-600 transition"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          )}

          {/* URL Input Method */}
          {imageInputMethod === "url" && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Enter image URL from web (e.g., https://example.com/image.jpg)</p>
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="border p-2 flex-1 rounded"
                />
                <button
                  onClick={handleValidateUrl}
                  disabled={validatingUrl || !imageUrl.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 hover:bg-blue-600 transition"
                >
                  {validatingUrl ? "Validating..." : "Validate"}
                </button>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {formData.image && (
            <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-700 font-medium mb-2">✓ Image Ready</p>
              <img
                src={formData.image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded border"
                onError={() => {
                  alert("Failed to load image preview. The URL or image may be invalid.");
                  setFormData({ ...formData, image: "" });
                }}
              />
              <button
                onClick={() => {
                  setFormData({ ...formData, image: "" });
                  setImageUrl("");
                  setSelectedFile(null);
                }}
                className="text-sm text-red-600 hover:text-red-800 mt-2"
              >
                Change Image
              </button>
            </div>
          )}
        </div>

        {/* Food Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Name" name="name" value={formData.name} onChange={handleChange} className="border p-3 rounded"/>
          <input type="number" placeholder="Price" name="price" value={formData.price} onChange={handleChange} className="border p-3 rounded"/>
          <input type="text" placeholder="Short Description" name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="border p-3 rounded"/>
          <input type="text" placeholder="Category (optional)" name="category" value={formData.category || ""} onChange={handleChange} className="border p-3 rounded"/>
        </div>
        <textarea 
          placeholder="Full Description" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          className="border p-3 rounded w-full mt-4 h-24"
        />
        
        <button 
          onClick={handleCreate} 
          disabled={!formData.image}
          className="bg-green-500 text-white px-6 py-3 rounded mt-4 disabled:bg-gray-400"
        >
          {isEditing ? "Update Food Item" : "Add Food Item"}
        </button>
        {isEditing && (
          <button 
            onClick={handleCancelEdit}
            className="bg-gray-500 text-white px-6 py-3 rounded mt-4 ml-4"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2">Name</th>
            <th className="border px-2">Price</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food._id}>
              <td className="border px-2">{food.name}</td>
              <td className="border px-2">${food.price}</td>
              <td className="border px-2">
                <button onClick={() => handleEdit(food)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                <button onClick={() => handleDelete(food._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-bold mt-12 mb-4">Order Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Order ID</th>
              <th className="border px-4 py-2">Customer</th>
              <th className="border px-4 py-2">Total</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Payment</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="border px-4 py-2">#{order._id.slice(-6)}</td>
                <td className="border px-4 py-2">{order.user?.name}</td>
                <td className="border px-4 py-2">${order.total.toFixed(2)}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${order.status === 'Paid' ? 'bg-green-100 text-green-800' : order.status === 'Delivered' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  {order.paymentConfirmed ? (
                    <span className="text-green-700 font-semibold">Confirmed</span>
                  ) : (
                    <span className="text-orange-700 font-medium">Awaiting</span>
                  )}
                </td>
                <td className="border px-4 py-2 text-center">
                  <select onChange={(e) => handleUpdateStatus(order._id, e.target.value)} value={order.status} className="border rounded p-1">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-4">User Management</h2>
      <p className="mb-4 text-gray-600">Total Users: {users.length}</p>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">Admin</th>
              <th className="border px-4 py-2">Verified</th>
              <th className="border px-4 py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.phoneNumber || 'N/A'}</td>
                <td className="border px-4 py-2">
                  {user.isAdmin ? (
                    <span className="text-green-600 font-semibold">Yes</span>
                  ) : (
                    <span className="text-gray-600">No</span>
                  )}
                </td>
                <td className="border px-4 py-2">
                  {user.isVerified ? (
                    <span className="text-green-600 font-semibold">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </td>
                <td className="border px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;