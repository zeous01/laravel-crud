// src/pages/FamilyIndex.jsx

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FamilyList from '../components/FamilyList';
import { employeeApi } from '../services/api'; // ya familyApi bana lo

export default function FamilyIndex() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const [searchFilters, setSearchFilters] = useState({
    family_name: '',
    relation: '',
  });

  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const debounceTimeout = useRef(null);

  const loadFamilies = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        sort_field: sortField,
        sort_direction: sortDirection,
        ...Object.fromEntries(
          Object.entries(searchFilters).filter(([_, v]) => v.trim() !== '')
        ),
      };

      // Agar alag API hai families ke liye, warna employeeApi se fetch karo with relations
      const res = await employeeApi.getAllFamilies(params); // ya jo bhi endpoint ho
      const data = res.data;

      setFamilies(data.data); // assume nested families flat kiye hue hon backend se
      setTotalRows(data.total);
      setPerPage(data.per_page);
      setCurrentPage(data.current_page);
    } catch (err) {
      console.error(err);
      alert('Error loading families');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      loadFamilies();
    }, 600);
  }, [searchFilters]);

  useEffect(() => {
    loadFamilies();
  }, [currentPage, perPage, sortField, sortDirection]);

  const handleSearchChange = (newFilters) => {
    setSearchFilters(newFilters);
  };

  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Family Members</h1>
        {/* Agar add family ka form hai to yahan button */}
      </div>

      <FamilyList
        families={families}
        loading={loading}
        totalRows={totalRows}
        perPage={perPage}
        handlePageChange={setCurrentPage}
        handlePerRowsChange={(newPerPage, page) => {
          setPerPage(newPerPage);
          setCurrentPage(page);
        }}
        searchFilters={searchFilters}
        onSearchChange={handleSearchChange}
        currentSortField={sortField}
        currentSortDirection={sortDirection}
        onSortChange={handleSortChange}
      />
    </div>
  );
}