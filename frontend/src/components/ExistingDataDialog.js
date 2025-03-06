import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Typography,
  Alert,
  Box,
  DialogContentText
} from '@mui/material';
import { CompareArrows as CompareIcon, Edit as EditIcon } from '@mui/icons-material';
import DateFormatter from '../utils/DateFormatter';
import ProductionSiteDataForm from './ProductionSiteDataForm';

const ExistingDataDialog = ({ open, onClose, onConfirm, existingData, newData, onUpdate }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (!existingData || !newData) return null;

  return (
    <>
      <Dialog
        open={open && !showReviewForm}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CompareIcon color="warning" />
            <Typography variant="h6">Existing Data Found</Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Data already exists for {DateFormatter.formatMonthYear(existingData.sk)}
          </Alert>
          <DialogContentText>
            Would you like to view and update the existing data?
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 3 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={() => setShowReviewForm(true)}
            color="primary"
            variant="contained"
            startIcon={<EditIcon />}
          >
            View & Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showReviewForm}
        onClose={() => {
          setShowReviewForm(false);
          onClose();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}>
          <Typography variant="h6">
            Update Existing Production Data
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {existingData && (
            <ProductionSiteDataForm
              initialData={{
                ...existingData,
                selectedDate: DateFormatter.fromApiFormat(existingData.sk),
                isExistingData: true
              }}
              onSubmit={async (formData) => {
                try {
                  await onUpdate(formData);
                  setShowReviewForm(false);
                  onClose();
                } catch (error) {
                  console.error('Update error:', error);
                }
              }}
              onCancel={() => {
                setShowReviewForm(false);
                onClose();
              }}
              startWithReview={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExistingDataDialog;