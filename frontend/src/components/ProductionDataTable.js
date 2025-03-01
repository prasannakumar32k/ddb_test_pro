import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import {
  EditOutlined as EditIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import DateFormatter from '../utils/DateFormatter';

const ProductionDataTable = ({ data = [], matrixType, onEdit, onDelete }) => {
  const calculateTotal = (row, type) => {
    try {
      if (type === 'unit') {
        return ['c1', 'c2', 'c3', 'c4', 'c5'].reduce((sum, key) =>
          sum + (parseFloat(row[key] || 0)), 0
        ).toFixed(2);
      } else {
        return ['c001', 'c002', 'c003', 'c004', 'c005', 'c006', 'c007', 'c008', 'c009', 'c010']
          .reduce((sum, key) => sum + (parseFloat(row[key] || 0)), 0
          ).toFixed(2);
      }
    } catch (error) {
      console.error('Error calculating total:', error);
      return '0.00';
    }
  };

  // Sort and normalize data
  const sortedData = useMemo(() => {
    return [...data]
      .filter(row => row && row.sk) // Filter out invalid rows
      .map(row => ({
        ...row,
        // Ensure all numeric fields are properly parsed
        ...(matrixType === 'unit'
          ? Array.from({ length: 5 }, (_, i) => ({
            [`c${i + 1}`]: parseFloat(row[`c${i + 1}`] || 0)
          })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
          : Array.from({ length: 10 }, (_, i) => ({
            [`c00${i + 1}`]: parseFloat(row[`c00${i + 1}`] || 0)
          })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
        )
      }))
      .sort(DateFormatter.sortDatesDesc);
  }, [data, matrixType]);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Month</TableCell>
            {matrixType === 'unit' ? (
              Array.from({ length: 5 }, (_, i) => (
                <TableCell key={`c${i + 1}`} align="right">C{i + 1}</TableCell>
              ))
            ) : (
              Array.from({ length: 10 }, (_, i) => (
                <TableCell key={`c00${i + 1}`} align="right">C00{i + 1}</TableCell>
              ))
            )}
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={row.sk} hover>
              <TableCell>{DateFormatter.formatMonthYear(row.sk)}</TableCell>
              {matrixType === 'unit' ? (
                Array.from({ length: 5 }, (_, i) => (
                  <TableCell key={`c${i + 1}`} align="right">
                    {row[`c${i + 1}`].toFixed(2)}
                  </TableCell>
                ))
              ) : (
                Array.from({ length: 10 }, (_, i) => (
                  <TableCell key={`c00${i + 1}`} align="right">
                    {row[`c00${i + 1}`].toFixed(2)}
                  </TableCell>
                ))
              )}
              <TableCell align="right">
                {calculateTotal(row, matrixType)}
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => onEdit(row)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(row)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductionDataTable;