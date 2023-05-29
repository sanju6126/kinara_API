const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// Load student details from file
function loadStudentDetails() {
  return new Promise((resolve, reject) => {
    const results = [];         
    fs.createReadStream('data.json') 
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// API endpoint for loading student details with pagination
app.get('/students', async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;

  try {
    const studentDetails = await loadStudentDetails();

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + parseInt(pageSize, 10);
    const paginatedData = studentDetails.slice(startIndex, endIndex);

    res.json({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      totalStudents: studentDetails.length,
      data: paginatedData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for server-side filtering
app.get('/students/filter', async (req, res) => {
  const { name, totalMarks } = req.query;

  try {
    const studentDetails = await loadStudentDetails();

    // Apply filtering
    let filteredData = studentDetails;
    if (name) {
      filteredData = filteredData.filter(student => student.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (totalMarks) {
      filteredData = filteredData.filter(student => student.totalMarks >= parseInt(totalMarks, 10));
    }

    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
