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
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

export default function ErrorDialoge({ open, handleClose, handleDelete }) {
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
          <DeleteForeverRoundedIcon
            sx={{ color: "var(--danger)", fontSize: 32 }}
          />
          <Typography
            sx={{
              fontWeight: 700,
              color: "var(--gray-dark)",
              fontSize: "20px"
            }}
          >
            Delete Confirmation
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
          Are you sure you want to delete this record?
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
          onClick={handleDelete}
          variant="contained"
          sx={{
            backgroundColor: "var(--danger)",
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#d61f45"
            }
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}