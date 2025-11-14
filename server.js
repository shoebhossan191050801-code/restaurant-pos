const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve the POS frontend (static HTML)
app.use(express.static(__dirname));

// Endpoint to handle order submission via frontend
app.post('/submitOrder', (req, res) => {
    const orders = req.body.orders;
    console.log('Order received from frontend:', orders);

    // Generate the PDF for the order
    generateOrderPDF(orders);

    res.json({ message: 'Order submitted and PDF generated' });
});

// Function to generate the order confirmation PDF
function generateOrderPDF(orders) {
    // Create a new PDF document
    const doc = new PDFDocument();

    // Create a writable stream to save the PDF
    doc.pipe(fs.createWriteStream('order_confirmation.pdf'));

    // Title
    doc.fontSize(18).text('--- Order Confirmation ---', { align: 'center' });
    doc.moveDown();

    // Loop through the orders and add them to the PDF
    let total = 0;
    orders.forEach(order => {
        doc.fontSize(12).text(`${order.quantity} x ${order.item}`);
        
        // Ensure addOns is an array before using .join()
        const addOns = Array.isArray(order.addOns) ? order.addOns : [];
        if (addOns.length > 0) {
            doc.fontSize(10).text(`Add-ons: ${addOns.join(', ')}`);
        }

        // Ensure removals is an array before using .join()
        const removals = Array.isArray(order.removals) ? order.removals : [];
        if (removals.length > 0) {
            doc.fontSize(10).text(`Removals: ${removals.join(', ')}`);
        }
        
        total += order.price * order.quantity;
    });

    // Add the total amount
    doc.fontSize(14).text(`Total: ${total} PKR`, { align: 'right' });

    // Finalize the PDF and end the stream
    doc.end();

    console.log('PDF generated successfully!');
}

app.listen(port, () => {
    console.log(`POS system running on http://localhost:${port}`);
});
