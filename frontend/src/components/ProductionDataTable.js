import React, { useState, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Power as PowerIcon,
  ElectricBolt as VoltageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import DateFormatter from '../utils/DateFormatter';

const ProductionDataTable = ({ data = [], onEdit, onDelete }) => {
  const [matrixType, setMatrixType] = useState('unit');

  const handleMatrixTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setMatrixType(newValue);
    }
  };

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

  const getColumns = () => {
    if (matrixType === 'unit') {
      return [
        { id: 'month', label: 'Month' },
        { id: 'c1', label: 'c1' },
        { id: 'c2', label: 'c2' },
        { id: 'c3', label: 'c3' },
        { id: 'c4', label: 'c4' },
        { id: 'c5', label: 'c5' },
        { id: 'total', label: 'Total' },
        { id: 'actions', label: 'Actions' }
      ];
    } else {
      return [
        { id: 'month', label: 'Month' },
        { id: 'c001', label: 'c001' },
        { id: 'c002', label: 'c002' },
        { id: 'c003', label: 'c003' },
        { id: 'c004', label: 'c004' },
        { id: 'c005', label: 'c005' },
        { id: 'c006', label: 'c006' },
        { id: 'c007', label: 'c007' },
        { id: 'c008', label: 'c008' },
        { id: 'c009', label: 'c009' },
        { id: 'c010', label: 'c010' },
        { id: 'total', label: 'Total' },
        { id: 'actions', label: 'Actions' }
      ];
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, my: 2 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6">
          Historical Production Data
        </Typography>
        <ToggleButtonGroup
          value={matrixType}
          exclusive
          onChange={handleMatrixTypeChange}
          size="small"
        >
          <ToggleButton value="unit">
            <PowerIcon sx={{ mr: 1 }} />
            Unit Matrix
          </ToggleButton>
          <ToggleButton value="charge">
            <VoltageIcon sx={{ mr: 1 }} />
            Charge Matrix
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {getColumns().map((column) => (
                <TableCell key={column.id}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow key={row.sk} hover>
                <TableCell>{DateFormatter.formatMonthYear(row.sk)}</TableCell>
                {matrixType === 'unit' ? (
                  <>
                    <TableCell>{row.c1.toFixed(2)}</TableCell>
                    <TableCell>{row.c2.toFixed(2)}</TableCell>
                    <TableCell>{row.c3.toFixed(2)}</TableCell>
                    <TableCell>{row.c4.toFixed(2)}</TableCell>
                    <TableCell>{row.c5.toFixed(2)}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{row.c001.toFixed(2)}</TableCell>
                    <TableCell>{row.c002.toFixed(2)}</TableCell>
                    <TableCell>{row.c003.toFixed(2)}</TableCell>
                    <TableCell>{row.c004.toFixed(2)}</TableCell>
                    <TableCell>{row.c005.toFixed(2)}</TableCell>
                    <TableCell>{row.c006.toFixed(2)}</TableCell>
                    <TableCell>{row.c007.toFixed(2)}</TableCell>
                    <TableCell>{row.c008.toFixed(2)}</TableCell>
                    <TableCell>{row.c009.toFixed(2)}</TableCell>
                    <TableCell>{row.c010.toFixed(2)}</TableCell>
                  </>
                )}
                <TableCell align="right">
                  {calculateTotal(row, matrixType)}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(row)}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(row)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ProductionDataTable;