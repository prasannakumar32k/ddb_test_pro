import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Paper
} from '@mui/material';
import ProductionSiteDataForm from './ProductionSiteDataForm';
import { updateProductionData } from '../services/productionapi';

const ProductionSiteDialog = ({
  open,
  onClose,
  onSubmit,
  editingData,
  companyId,
  productionSiteId,
  onUpdateSuccess
}) => {
  return (
    <Dialog
      open={open}
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
        px: 3,
        py: 2
      }}>
        {editingData ? 'Edit Production Site' : 'Add Production Site'}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <ProductionSiteDataForm
          initialData={editingData}
          onSubmit={onSubmit}
          onCancel={onClose}
          companyId={companyId}
          productionSiteId={productionSiteId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductionSiteDialog;