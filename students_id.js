// Import required modules
const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

// Create an Express application
const app = express();
const port = 3000;

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Sunit@123',
  database: 'students'
};

// Define a route to generate student ID cards
app.get('/generate-id-cards', async (req, res) => {
  try {
    // Connect to MySQL database
    const connection = await mysql.createConnection(dbConfig);

    // Fetch student data from the database
    const [rows] = await connection.query('SELECT * FROM students');

    // Create a new PDF document
    const doc = new PDFDocument();
    const outputFilePath = path.resolve(__dirname, 'id_cards.pdf');
    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);

    // Loop through each student
    for (const student of rows) {
      // Load student image from file system
      const imagePath = `D:/Users/Sumit/Desktop/${student.id}.png`; // images are named as student IDs
      const imageData = fs.readFileSync(imagePath);

      // Add student information and image to PDF
      doc.fontSize(12).text(`Name: ${student.name}, roll_number: ${student.roll_number}`);
      doc.image(imageData, 100, 100, { width: 200 });

      // Add page break after each student
      doc.addPage();
    }

    // Finalize PDF document
    doc.end();

    // Close MySQL connection
    await connection.end();

    // Send generated PDF as response
    res.sendFile(outputFilePath);
  } catch (error) {
    console.error('Error generating ID cards:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
