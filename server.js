const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Ensure your index.html is in the correct directory
});

// API endpoint to handle order submission
app.post('/submitOrder', (req, res) => {
    const orders = req.body.orders;
    console.log('Order received from frontend:', orders);

    // Generate the PDF for the order
    generateOrderPDF(orders);

    res.json({ message: 'Order submitted and PDF generated' });
});

// Function to generate the order confirmation PDF
function generateOrderPDF(orders) {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('order_confirmation.pdf'));

    doc.fontSize(18).text('--- Order Confirmation ---', { align: 'center' });
    doc.moveDown();

    let total = 0;
    orders.forEach(order => {
        doc.fontSize(12).text(`${order.quantity} x ${order.item}`);
        const addOns = Array.isArray(order.addOns) ? order.addOns : [];
        if (addOns.length > 0) {
            doc.fontSize(10).text(`Add-ons: ${addOns.join(', ')}`);
        }
        const removals = Array.isArray(order.removals) ? order.removals : [];
        if (removals.length > 0) {
            doc.fontSize(10).text(`Removals: ${removals.join(', ')}`);
        }
        total += order.price * order.quantity;
    });

    doc.fontSize(14).text(`Total: ${total} PKR`, { align: 'right' });
    doc.end();

    console.log('PDF generated successfully!');
}

app.listen(port, () => {
    console.log(`POS system running on http://localhost:${port}`);
});
