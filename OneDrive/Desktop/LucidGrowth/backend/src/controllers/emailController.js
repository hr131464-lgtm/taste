/**
 * Email Controller
 * 
 * Handles HTTP requests for email-related operations
 */

const Email = require('../models/Email');

const emailReceiver = require('../services/emailReceiver');
const emailProcessor = require('../services/emailProcessor');
const { simpleParser } = require('mailparser');

/**
 * @desc    Get email configuration
 * @route   GET /api/emails/config
 * @access  Public
 */
const getEmailConfig = async (req, res) => {
  try {
    const config = emailReceiver.getEmailConfig();
    
    res.json({
      success: true,
      data: {
        testEmailAddress: config.testEmailAddress,
        testSubjectPrefix: config.testSubjectPrefix,
        instructions: `Send an email to ${config.testEmailAddress} with subject containing "${config.testSubjectPrefix}"`,
        isMonitoring: config.isMonitoring,
        isConnected: config.isConnected
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get all emails
 * @route   GET /api/emails
 * @access  Public
 */
const getAllEmails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Filter by test emails only if requested
    if (req.query.testOnly === 'true') {
      filter.isTestEmail = true;
    }
    
    // Filter by processing status
    if (req.query.status) {
      filter.processingStatus = req.query.status;
    }

    const emails = await Email.find(filter)
      .sort({ receivedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-rawHeaders -rawBody'); // Exclude large fields

    const total = await Email.countDocuments(filter);

    res.json({
      success: true,
      data: {
        emails,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get email by ID
 * @route   GET /api/emails/:id
 * @access  Public
 */
const getEmailById = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email not found'
      });
    }

    res.json({
      success: true,
      data: email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get receiving chain for email
 * @route   GET /api/emails/:id/receiving-chain
 * @access  Public
 */
const getReceivingChain = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id).select('receivingChain subject from');
    
    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email not found'
      });
    }

    res.json({
      success: true,
      data: {
        emailId: email._id,
        subject: email.subject,
        from: email.from,
        receivingChain: email.receivingChain,
        totalHops: email.receivingChain.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get ESP information for email
 * @route   GET /api/emails/:id/esp
 * @access  Public
 */
const getESPInfo = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id).select('espInfo subject from');
    
    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email not found'
      });
    }

    res.json({
      success: true,
      data: {
        emailId: email._id,
        subject: email.subject,
        from: email.from,
        espInfo: email.espInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Manually trigger email processing
 * @route   POST /api/emails/process
 * @access  Public
 */
const processEmails = async (req, res) => {
  try {
    const results = await emailProcessor.processPendingEmails();
    
    res.json({
      success: true,
      data: {
        message: 'Email processing triggered',
        results
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete email
 * @route   DELETE /api/emails/:id
 * @access  Public
 */
const deleteEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email not found'
      });
    }

    await Email.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {
        message: 'Email deleted successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get email processing statistics
 * @route   GET /api/emails/stats/summary
 * @access  Public
 */
const getEmailStats = async (req, res) => {
  try {
    const stats = await emailProcessor.getProcessingStats();
    
    // Get recent activity
    const recentEmails = await Email.find()
      .sort({ receivedAt: -1 })
      .limit(5)
      .select('subject from receivedAt processingStatus espInfo.provider');

    res.json({
      success: true,
      data: {
        stats,
        recentActivity: recentEmails
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getEmailConfig,
  getAllEmails,
  getEmailById,
  getReceivingChain,
  getESPInfo,
  processEmails,
  deleteEmail,
  getEmailStats,
  inboundWebhook
};

/**
 * @desc    Inbound email webhook (SendGrid/Mailgun)
 * @route   POST /api/emails/inbound
 * @access  Public (recommend protecting with shared secret or provider signature)
 */
async function inboundWebhook(req, res) {
  try {
    // Optional shared secret guard
    if (process.env.INBOUND_WEBHOOK_SECRET) {
      const provided = req.query?.secret || req.headers['x-inbound-secret'];
      if (!provided || provided !== process.env.INBOUND_WEBHOOK_SECRET) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
    }

    // Acknowledge immediately to prevent ESP retries
    res.status(200).send('OK');

    // Extract raw email content - varies by provider
    const rawEmail = req.body?.email || req.body?.['body-mime'] || req.body?.mime || null;
    if (!rawEmail) {
      console.warn('Inbound webhook received without raw email payload');
      return;
    }

    // Parse MIME
    const parsed = await simpleParser(rawEmail);

    // Create DB record (similar to saveAndProcessEmail in emailReceiver)
    const emailData = {
      messageId: parsed.messageId,
      subject: parsed.subject || '',
      from: parsed.from?.text || '',
      to: parsed.to?.text || '',
      date: parsed.date || new Date(),
      rawHeaders: rawEmail.substring(0, rawEmail.indexOf('\r\n\r\n')) || rawEmail,
      rawBody: parsed.text || '',
      size: rawEmail.length,
      attachmentCount: parsed.attachments ? parsed.attachments.length : 0,
      isTestEmail: (parsed.subject || '').includes(process.env.TEST_SUBJECT_PREFIX || 'EMAIL_ANALYSIS_TEST'),
      processingStatus: 'pending'
    };

    const email = await new Email(emailData).save();

    // Process asynchronously
    emailProcessor.processEmail(email._id).catch(err => {
      console.error('Error processing inbound email:', err);
    });

  } catch (error) {
    console.error('Inbound webhook error:', error);
    // We already sent 200; nothing else to do
  }
}

