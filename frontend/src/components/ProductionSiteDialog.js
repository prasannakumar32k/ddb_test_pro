import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent
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
  const handleSubmit = async (data) => {
    try {
      if (editingData) {
        // Handle update
        await updateProductionData(companyId, productionSiteId, data);
        onUpdateSuccess?.();
      } else {
        // Handle create
        await onSubmit(data);
      }
      onClose();
    } catch (error) {
      console.error('Dialog submission error:', error);
      throw error;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {editingData ? 'Edit Production Data' : 'Add Production Data'}
      </DialogTitle>
      <DialogContent>
        <ProductionSiteDataForm
          initialData={editingData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isEdit={!!editingData}
        />
      </DialogContent>
    </Dialog>
  );
};

// Example usage in parent component
const ParentComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const handleSubmit = async (data) => {
    try {
      // Handle form submission
      await submitData(data);
      setDialogOpen(false);
      setEditingData(null);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <>
      {/* Your other components */}
      <ProductionSiteDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingData(null);
        }}
        onSubmit={handleSubmit}
        editingData={editingData}
        companyId={companyId}
        productionSiteId={productionSiteId}
      />
    </>
  );
};

export default ProductionSiteDialog;