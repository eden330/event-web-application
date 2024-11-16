import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { EventModel } from "../models/EventModel";
import { fetchEventsMap } from "../../../api/eventApi";
import { deleteEventById } from "../../../api/services/userService";

const MySwal = withReactContent(Swal);

const EventsAdminPanel: React.FC = () => {
    const [events, setEvents] = useState<EventModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const data = await fetchEventsMap();
            setEvents(data);
            console.log("Fetched events from map endpoint:", data);
        } catch (err) {
            console.error("Failed to fetch events:", err);
            setError("Failed to fetch events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (event: EventModel) => {
        try {
            const result = await MySwal.fire({
                title: `Delete Event "${event.name}"?`,
                text: "This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!",
            });

            if (result.isConfirmed) {
                console.log(`Attempting to delete event: ${event.name} (ID: ${event.id})`);
                await deleteEventById(event.id);
                setEvents((prevEvents) => prevEvents.filter((e) => e.id !== event.id));
                MySwal.fire("Deleted!", `Event "${event.name}" has been deleted.`, "success");
            }
        } catch (err) {
            console.error("Failed to delete event:", err);
            MySwal.fire("Error!", "Failed to delete event. Please try again.", "error");
        }
    };

    useEffect(() => {
        fetchEvents();
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
            <h2 className="text-center mb-4">Event Management</h2>
            <div
                style={{
                    maxHeight: "600px",
                    overflowY: "auto",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                }}
            >
                <Row xs={1} md={2} lg={3} className="g-4">
                    {events.map((event) => (
                        <Col key={event.id}>
                            <Card
                                className="h-100 shadow-sm"
                                style={{
                                    width: "300px",
                                    height: "400px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Card.Img
                                    variant="top"
                                    src={event.image}
                                    alt={event.name}
                                    style={{ height: "180px", objectFit: "cover" }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="text-primary">{event.name}</Card.Title>
                                    <Card.Text>
                                        <strong>Start Date:</strong>{" "}
                                        {new Date(event.startDate).toLocaleDateString()}
                                        <br />
                                        <strong>End Date:</strong>{" "}
                                        {new Date(event.endDate).toLocaleDateString()}
                                        <br />
                                        <strong>Category:</strong> {event.category.eventCategory}
                                    </Card.Text>
                                    <div className="mt-auto d-flex justify-content-center">
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeleteEvent(event)}
                                        >
                                            Delete Event
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default EventsAdminPanel;
