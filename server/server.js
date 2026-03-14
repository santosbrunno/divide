const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const app = express();

function logToFile(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync('C:/Users/BRUNO SOARES/Desktop/Divide/server_debug.log', `[${timestamp}] ${msg}\n`);
}

app.use(cors()); app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'divide_app'
});

// Rota de Cadastro
app.post('/cadastro', (req, res) => {
    let { nome, email, cpf, senha, tipo_perfil, cnh } = req.body;
    
    logToFile(`--- TENTATIVA DE CADASTRO: ${email} (${tipo_perfil}) ---`);
    logToFile(`Dados: ${JSON.stringify({...req.body, senha: '***'})}`);
    
    // Validate that tipo_perfil is not 'admin'
    if (tipo_perfil === 'admin') {
        return res.status(403).json({ error: "Não é permitido registrar-se como administrador." });
    }

    console.log("--- NOVA TENTATIVA DE CADASTRO ---");
    console.log("Dados recebidos:", { ...req.body, senha: '***' });

    const sql = "INSERT INTO users (nome, email, cpf, cnh, senha, tipo_perfil) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [nome, email, cpf, cnh || null, senha, tipo_perfil], (err, result) => {
        if (err) {
            console.error("❌ Erro ao criar usuário:", err.message);
            logToFile(`❌ Erro cadastro (${email}): ${err.message}`);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: "E-mail ou CPF já cadastrados!" });
            }
            return res.status(500).json({ error: "Erro interno ao criar usuário: " + err.message });
        }
        
        const userId = result.insertId;
        console.log("✅ Usuário criado com ID:", userId);
        logToFile(`✅ Usuário criado: ${email} (ID: ${userId})`);

        // Se for motorista, cadastrar o veículo inicial
        const { veiculo } = req.body;
        if (tipo_perfil === 'driver' && veiculo) {
            console.log("🚙 Cadastrando veículo para o motorista:", veiculo);
            const sqlVehicle = "INSERT INTO vehicles (owner_id, brand, model, plate, color) VALUES (?, ?, ?, ?, ?)";
            db.query(sqlVehicle, [userId, veiculo.marca, veiculo.modelo, veiculo.placa, veiculo.cor], (vErr) => {
                if (vErr) {
                    console.error("❌ Erro ao cadastrar veículo:", vErr.message);
                    logToFile(`❌ Erro veículo para ID ${userId}: ${vErr.message}`);
                    // Mesmo com erro no veículo, o usuário foi criado. 
                    // Mas vamos avisar o mobile para que o admin saiba.
                    return res.status(201).json({ 
                        message: "Usuário criado, mas houve um erro ao salvar o veículo.", 
                        id: userId,
                        vehicleError: vErr.message 
                    });
                } else {
                    console.log("✅ Veículo cadastrado com sucesso!");
                    logToFile(`✅ Veículo cadastrado para ID ${userId}`);
                    return res.status(201).json({ message: "Usuário e veículo criados com sucesso!", id: userId });
                }
            });
        } else {
            return res.status(201).json({ message: "Usuário criado com sucesso!", id: userId });
        }
    });
});

// Rota de Login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    logToFile(`🔑 Login: ${email}`);

    console.log(`🔑 Tentativa de Login: ${email}`);
    
    const sql = "SELECT * FROM users WHERE email = ? AND senha = ?";
    
    db.query(sql, [email, senha], (err, results) => {
        if (err) {
            console.error("Erro no banco:", err);
            return res.status(500).json({ error: "Erro no servidor" });
        }
        
        if (results.length === 0) {
            console.log("❌ Credenciais inválidas");
            return res.status(401).json({ error: "E-mail ou senha incorretos" });
        }
        
        const user = results[0];
        console.log(`✅ Login realizado: ${user.nome} (${user.tipo_perfil})`);
        
        res.json({
            id: user.user_id,
            nome: user.nome,
            perfil: user.tipo_perfil,
            status: user.status_motorista
        });
    });
});

// Listar caronas (Onde o app vai buscar)
app.get('/caronas', (req, res) => {
    const sql = "SELECT r.*, u.nome as motorista, v.modelo FROM rides r JOIN users u ON r.driver_id = u.user_id JOIN vehicles v ON r.vehicle_id = v.vehicle_id WHERE r.status_carona = 'aberta'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});
// Rota para oferecer carona (com trava de segurança)
app.post('/oferecer-carona', (req, res) => {
    const { driver_id, vehicle_id, origem, destino, data_partida, vagas, preco_base } = req.body;

    // 1. Verificar se o motorista está aprovado
    const sqlCheckStatus = "SELECT status_motorista FROM users WHERE user_id = ? AND tipo_perfil = 'driver'";

    db.query(sqlCheckStatus, [driver_id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ error: "Erro ao verificar motorista." });
        }

        const status = results[0].status_motorista;

        if (status !== 'aprovado') {
            return res.status(403).json({ 
                error: "Sua conta de motorista ainda está em análise. Aguarde a aprovação do Admin para postar caronas." 
            });
        }

        // 2. Se estiver aprovado, segue o jogo e cria a carona
        const sqlInsertRide = "INSERT INTO rides (driver_id, vehicle_id, origem, destino, data_partida, vagas_disponiveis, preco_base) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        db.query(sqlInsertRide, [driver_id, vehicle_id, origem, destino, data_partida, vagas, preco_base], (err) => {
            if (err) {
                console.error("Erro ao criar carona:", err);
                return res.status(500).json(err);
            }
            res.json({ message: "Carona publicada com sucesso!" });
        });
    });
});

// Rota para realizar a reserva
app.post('/reservar', (req, res) => {
    console.log("Recebida requisição /reservar:", req.body);
    const { ride_id, passenger_id, preco_base } = req.body;
    const taxa = preco_base * 0.10; // Seus 10% de lucro
    const valor_total = preco_base + taxa;
    console.log(`Valores Calculados: taxa=${taxa}, valor_total=${valor_total}`);

    // 1. Verificar e Diminuir 1 vaga se houver vagas disponíveis
    const sqlUpdateRide = "UPDATE rides SET vagas_disponiveis = vagas_disponiveis - 1 WHERE ride_id = ? AND vagas_disponiveis > 0";
    
    db.query(sqlUpdateRide, [ride_id], (err, result) => {
        if (err || result.affectedRows === 0) {
            console.error("Erro no passo 1 (Vagas):", err || "Nenhuma vaga ou carona não encontrada");
            return res.status(400).json({ error: "Sem vagas ou erro na carona" });
        }

        // 2. Criar o registro da reserva com o seu lucro de 10%
        const sqlInsertBooking = "INSERT INTO bookings (ride_id, passenger_id, valor_pago, taxa_plataforma, status) VALUES (?, ?, ?, ?, 'confirmado')";
        
        db.query(sqlInsertBooking, [ride_id, passenger_id, valor_total, taxa], (err2) => {
            if (err2) {
                console.error("Erro no passo 2 (Insert Booking):", err2);
                // Tentativa de rollback manual para as vagas (opcional, manter simples agora)
                return res.status(500).json(err2);
            }

            res.json({ message: "Reserva confirmada em SC!", lucro: taxa });
        });
    });
});
app.get('/minhas-reservas/:id', (req, res) => {
    const passenger_id = req.params.id;
    const sql = `
        SELECT b.*, r.origem, r.destino, r.data_partida as horario_partida, u.nome as motorista, v.modelo as carro
        FROM bookings b
        JOIN rides r ON b.ride_id = r.ride_id
        JOIN users u ON r.driver_id = u.user_id
        JOIN vehicles v ON r.vehicle_id = v.vehicle_id
        WHERE b.passenger_id = ?
        ORDER BY r.data_partida DESC
    `;
    db.query(sql, [passenger_id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Buscar caronas oferecidas pelo motorista e seus respectivos passageiros
app.get('/motorista/:id/caronas', (req, res) => {
    const driver_id = req.params.id;
    const sql = `
        SELECT 
            r.ride_id, r.origem, r.destino, r.data_partida as horario_partida, r.vagas_disponiveis, r.preco_base,
            b.booking_id, b.valor_pago,
            u.user_id as passageiro_id, u.nome as passageiro_nome
        FROM rides r
        LEFT JOIN bookings b ON r.ride_id = b.ride_id AND b.status = 'confirmado'
        LEFT JOIN users u ON b.passenger_id = u.user_id
        WHERE r.driver_id = ?
        ORDER BY r.data_partida DESC
    `;
    db.query(sql, [driver_id], (err, results) => {
        if (err) {
            console.error("Erro ao buscar caronas do motorista:", err);
            return res.status(500).json(err);
        }
        res.json(results);
    });
});

// Admin: Faturamento Total e Estatísticas
app.get('/admin/faturamento', (req, res) => {
    const sql = `
        SELECT 
            (SELECT SUM(taxa_plataforma) FROM bookings WHERE status = 'confirmado') as faturamento,
            (SELECT COUNT(*) FROM bookings WHERE status = 'confirmado') as viagens
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ 
            total_faturamento: results[0].faturamento || 0,
            total_viagens: results[0].viagens || 0
        });
    });
});

// Admin: Últimas Taxas Recebidas
app.get('/admin/taxas-recentes', (req, res) => {
    const sql = `
        SELECT b.booking_id, b.taxa_plataforma, b.data_reserva, 
               r.origem as origin_city, r.destino as destination_city, u.nome as passageiro
        FROM bookings b
        JOIN rides r ON b.ride_id = r.ride_id
        JOIN users u ON b.passenger_id = u.user_id
        ORDER BY b.data_reserva DESC
        LIMIT 10
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Admin: Listar motoristas pendentes
app.get('/admin/motoristas/pendentes', (req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] Admin buscando motoristas pendentes...`);
    const sql = `
        SELECT u.user_id, u.nome, u.email, u.cpf, u.cnh, u.created_at, 
               v.brand, v.model, v.plate, v.color
        FROM users u 
        LEFT JOIN vehicles v ON u.user_id = v.owner_id
        WHERE u.tipo_perfil = 'driver' AND u.status_motorista = 'pendente'
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erro na busca de pendentes:", err);
            return res.status(500).json(err);
        }
        console.log(`Encontrados ${results.length} motoristas pendentes.`);
        res.json(results);
    });
});

// Admin: Aprovar ou Rejeitar motorista
app.patch('/admin/motoristas/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'aprovado' ou 'rejeitado'

    if (!['aprovado', 'rejeitado'].includes(status)) {
        return res.status(400).json({ error: "Status inválido." });
    }

    const sql = "UPDATE users SET status_motorista = ? WHERE user_id = ? AND tipo_perfil = 'driver'";
    db.query(sql, [status, id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Motorista não encontrado." });
        res.json({ message: `Motorista ${status} com sucesso!` });
    });
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));