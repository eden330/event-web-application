import React, {useEffect, useState} from "react";
import {Button, Card, Col, Row, Spinner} from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {deleteUser, fetchAllUsers} from "../../../api/services/userService";

interface User {
    id: number;
    username: string;
    email: string;
    roles: { name: string }[];
}

const MySwal = withReactContent(Swal);

const UsersAdminPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await fetchAllUsers();
            setUsers(data);
            console.log("Fetched users:", data);
        } catch (err) {
            setError("Failed to fetch users. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (user: User) => {
        try {
            const result = await MySwal.fire({
                title: `Delete User "${user.username}"?`,
                text: "This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!",
            });

            if (result.isConfirmed) {
                console.log(`Attempting to delete user: ${user.username} (ID: ${user.id})`);
                await deleteUser(user.id);
                setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
                MySwal.fire("Deleted!", `User "${user.username}" has been deleted.`, "success");
            }
        } catch (err) {
            console.error("Failed to delete user:", err);
            MySwal.fire("Error!", "Failed to delete user. Please try again.", "error");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return <div className="text-danger text-center mt-5">{error}</div>;
    }

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">User Management</h2>
            <Row xs={1} md={2} lg={3} className="g-4">
                {users.map((user) => (
                    <Col key={user.id}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title className="text-primary">{user.username}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">{user.email}</Card.Subtitle>
                                <Card.Text>
                                    <strong>Roles:</strong> {user.roles.map((role) => role.name).join(", ")}
                                </Card.Text>
                                <Button variant="danger" className="mt-2" onClick={() => handleDeleteUser(user)}>
                                    Delete User
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default UsersAdminPanel;
