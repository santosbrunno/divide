const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'divide_app'
});

const userId = 6; // Bruno Soares
const veiculo = {
    marca: "Teste",
    modelo: "Teste",
    placa: "TST-0000",
    cor: "Preto"
};

console.log("🚙 Testando inserção direta para ID 6...");
const sqlVehicle = "INSERT INTO vehicles (owner_id, brand, model, plate, color) VALUES (?, ?, ?, ?, ?)";
db.query(sqlVehicle, [userId, veiculo.marca, veiculo.modelo, veiculo.placa, veiculo.cor], (vErr, result) => {
    if (vErr) {
        console.error("❌ Erro:", vErr.message);
    } else {
        console.log("✅ Sucesso:", result);
    }
    db.end();
});
