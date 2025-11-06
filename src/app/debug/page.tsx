"use client";

import { useAuth } from "../context/AuthContext";

const DebugPage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>

      <div className="bg-gray-100 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">User Data:</h2>
        <pre className="bg-white p-4 rounded border overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Analysis:</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>User exists:</strong> {user ? "Yes" : "No"}
          </li>
          <li>
            <strong>Role:</strong> {user?.role || "N/A"}
          </li>
          <li>
            <strong>Email:</strong> {user?.email || "N/A"}
          </li>
          <li>
            <strong>Employee ID:</strong> {user?.employeeId || "Not found"}
          </li>
          <li>
            <strong>Customer ID:</strong> {user?.customerId || "Not found"}
          </li>
          <li>
            <strong>Admin ID:</strong> {user?.adminId || "Not found"}
          </li>
          <li>
            <strong>General ID:</strong> {(user as any)?.id || "Not found"}
          </li>
        </ul>
      </div>

      <div className="mt-6 bg-yellow-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Next Steps:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Check if the profile API returns an ID field</li>
          <li>Verify the correct API endpoint for employee data</li>
          <li>Ensure the backend is properly configured</li>
          <li>Check network requests in browser dev tools</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugPage;
