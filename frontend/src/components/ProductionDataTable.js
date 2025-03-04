import React, { useMemo } from 'react';
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
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Power as PowerIcon,
  ElectricBolt as VoltageIcon
} from '@mui/icons-material';
import DateFormatter from '../utils/DateFormatter';

const ProductionDataTable = ({ data = [], matrixType = 'unit', onEdit, onDelete }) => {
  const theme = useTheme();

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
        <Typography variant="h6" color="primary.main">
          Production Data
        </Typography>
      </Box>

      <TableContainer>
        <Table
          size="small"
          sx={{
            '& .MuiTableHead-root': {
              bgcolor: theme.palette.primary.lighter,
            },
            '& .MuiTableCell-head': {
              fontWeight: 'bold',
              color: theme.palette.primary.main
            }
          }}
        >
          <TableHead>
            <TableRow>
              {getColumns().map((column) => (
                <TableCell
                  key={column.id}
                  align={column.id === 'actions' || column.id === 'total' ? 'right' : 'left'}
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                    padding: '12px 16px'  // Consistent padding
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((row) => (
                <TableRow
                  key={row.sk}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                >
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    {DateFormatter.formatMonthYear(row.sk)}
                  </TableCell>
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
                  <TableCell align="right" sx={{ color: theme.palette.primary.main }}>
                    {calculateTotal(row, matrixType)}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{
                      display: 'flex',
                      gap: 1,
                      justifyContent: 'flex-end'
                    }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(row)}
                          sx={{
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.lighter
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(row)}
                          sx={{
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: theme.palette.error.lighter
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={matrixType === 'unit' ? 8 : 13}
                  align="center"
                  sx={{ py: 3 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No production data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ProductionDataTable;