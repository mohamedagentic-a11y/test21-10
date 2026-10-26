import { Request, Response } from 'express';
import { query } from '../db/index';

export const submitClaim = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pnr, bagTagNumber, description } = req.body;
    
    if (!pnr || !bagTagNumber || !description) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_FAILED',
        message: 'Missing required fields: pnr, bagTagNumber, description'
      });
      return;
    }

    const result = await query(
      'INSERT INTO claims (pnr, bag_tag_number, description, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, pnr, bag_tag_number as "bagTagNumber", description, status',
      [pnr, bagTagNumber, description, 'SUBMITTED']
    );

    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while submitting the claim.'
    });
  }
};

export const getClaimStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { claimId } = req.params;

    if (!claimId) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_FAILED',
        message: 'Claim ID is required.'
      });
      return;
    }

    const result = await query(
      'SELECT id, pnr, bag_tag_number as "bagTagNumber", description, status, created_at as "createdAt" FROM claims WHERE id = $1',
      [claimId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Claim not found.'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while retrieving the claim status.'
    });
  }
};