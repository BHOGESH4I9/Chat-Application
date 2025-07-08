import React from "react";
import { Form } from "react-bootstrap";
import { useChatContext } from "../../context/ChatContext";

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useChatContext();

  return (
    <Form className="mb-3">
      <Form.Control
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="rounded-pill shadow-sm"
      />
    </Form>
  );
};

export default SearchBar;
