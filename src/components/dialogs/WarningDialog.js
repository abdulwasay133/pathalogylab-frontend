import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function WarningDialog({ open, handleClose, handleConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          padding: "10px",
          minWidth: "380px"
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningAmberRoundedIcon
            sx={{ color: "var(--warning)", fontSize: 32 }}
          />
          <Typography
            sx={{
              fontWeight: 700,
              color: "var(--gray-dark)",
              fontSize: "20px"
            }}
          >
            Warning
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography
          sx={{
            color: "var(--gray)",
            fontSize: "15px",
            mt: 1
          }}
        >
          Are you sure you want to continue? This action may affect important
          data and cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ pr: 2, pb: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderColor: "var(--gray)",
            color: "var(--gray-dark)",
            borderRadius: "8px",
            textTransform: "none"
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            backgroundColor: "var(--warning)",
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "var(--danger)"
            }
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}