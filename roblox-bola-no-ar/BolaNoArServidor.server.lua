--[[
	BOLA NO AR ⚽ — parte do SERVIDOR
	Coloque este Script dentro de ServerScriptService.

	O que ele faz:
	- Cria as arenas (o chão, as paredes de vidro e a bola).
	- Jogar SOZINHO: cada jogador ganha uma arena só dele.
	- Jogar ONLINE: todo mundo do servidor joga junto na mesma arena
	  e tenta não deixar a MESMA bola cair.
	- Conta os toques, guarda o recorde de cada um e monta o ranking.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

-- Mude esses números pra deixar o jogo mais fácil ou mais difícil
local CONFIG = {
	TAMANHO_ARENA = 70,           -- largura do chão
	ALTURA_PAREDE = 45,           -- altura das paredes de vidro
	TAMANHO_BOLA = 4,
	FORCA_PRA_CIMA = 60,          -- quanto a bola sobe quando você bate
	FORCA_PRO_LADO = 14,          -- quanto ela vai pro lado
	ALCANCE_DO_CLIQUE = 14,       -- distância máxima pra bater clicando
	ESPERA_ENTRE_TOQUES = 0.25,   -- segundos entre um toque e outro
	ANTIGRAVIDADE_INICIAL = 0.7,  -- 0.7 = a bola cai bem devagar no começo
	ANTIGRAVIDADE_MINIMA = 0.35,  -- a cada toque ela fica mais rápida, até aqui
	SEGUNDOS_PRA_RECOMECAR = 3,
	ALTURA_DAS_ARENAS = 300,      -- as arenas ficam flutuando no céu
}

---------------------------------------------------------------------
-- Comunicação com o celular/computador do jogador (RemoteEvents)
---------------------------------------------------------------------
local pasta = Instance.new("Folder")
pasta.Name = "BolaNoAr"
pasta.Parent = ReplicatedStorage

local function criarRemote(classe, nome)
	local r = Instance.new(classe)
	r.Name = nome
	r.Parent = pasta
	return r
end

local Entrar = criarRemote("RemoteEvent", "Entrar")          -- jogador escolheu "solo" ou "online"
local Bater = criarRemote("RemoteEvent", "Bater")            -- jogador clicou pra bater na bola
local Sair = criarRemote("RemoteEvent", "Sair")              -- jogador voltou pro menu
local Atualizar = criarRemote("RemoteEvent", "Atualizar")    -- servidor avisa o placar
local PegarRanking = criarRemote("RemoteFunction", "PegarRanking")

local jogandoOnline = Instance.new("IntValue")
jogandoOnline.Name = "JogandoOnline"
jogandoOnline.Parent = pasta

---------------------------------------------------------------------
-- Recordes salvos (só funciona com o jogo publicado e com
-- "Enable Studio Access to API Services" ligado nas configurações)
---------------------------------------------------------------------
local recordesDS, rankingDS
pcall(function()
	recordesDS = DataStoreService:GetDataStore("BolaNoAr_Recordes_v1")
	rankingDS = DataStoreService:GetOrderedDataStore("BolaNoAr_Ranking_v1")
end)

local function carregarRecorde(player)
	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	leaderstats.Parent = player

	local recorde = Instance.new("IntValue")
	recorde.Name = "Recorde"
	recorde.Parent = leaderstats

	if recordesDS then
		local ok, valor = pcall(function()
			return recordesDS:GetAsync(tostring(player.UserId))
		end)
		if ok and typeof(valor) == "number" then
			recorde.Value = valor
		end
	end
end

-- Devolve true se for um recorde novo
local function salvarRecorde(player, toques)
	local leaderstats = player:FindFirstChild("leaderstats")
	local recorde = leaderstats and leaderstats:FindFirstChild("Recorde")
	if not recorde or toques <= recorde.Value then
		return false
	end
	recorde.Value = toques

	task.spawn(function()
		local chave = tostring(player.UserId)
		if recordesDS then
			pcall(function()
				recordesDS:UpdateAsync(chave, function(antigo)
					return math.max(antigo or 0, toques)
				end)
			end)
		end
		if rankingDS then
			pcall(function()
				rankingDS:UpdateAsync(chave, function(antigo)
					return math.max(antigo or 0, toques)
				end)
			end)
		end
	end)
	return true
end

-- Ranking do mundo todo (os 10 melhores), guardado por 1 minuto
local nomesGuardados = {}
local rankingGuardado = {}
local horaDoRanking = -1000

PegarRanking.OnServerInvoke = function()
	if os.clock() - horaDoRanking < 60 or not rankingDS then
		return rankingGuardado
	end
	horaDoRanking = os.clock()

	local ok, paginas = pcall(function()
		return rankingDS:GetSortedAsync(false, 10)
	end)
	if not ok then
		return rankingGuardado
	end

	local lista = {}
	for posicao, item in ipairs(paginas:GetCurrentPage()) do
		local nome = nomesGuardados[item.key]
		if not nome then
			local okNome, achado = pcall(function()
				return Players:GetNameFromUserIdAsync(tonumber(item.key))
			end)
			nome = okNome and achado or "???"
			nomesGuardados[item.key] = nome
		end
		table.insert(lista, { posicao = posicao, nome = nome, toques = item.value })
	end
	rankingGuardado = lista
	return lista
end

---------------------------------------------------------------------
-- Arenas
---------------------------------------------------------------------
local pastaArenas = Instance.new("Folder")
pastaArenas.Name = "ArenasBolaNoAr"
pastaArenas.Parent = workspace

local todasArenas = {}       -- [arena] = true
local arenaDoJogador = {}    -- [player] = arena
local contadorSolo = 0

local function criarParte(nome, tamanho, posicao, pai)
	local p = Instance.new("Part")
	p.Name = nome
	p.Anchored = true
	p.Size = tamanho
	p.Position = posicao
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.Parent = pai
	return p
end

local function criarArena(nome, centro, corDoChao, online)
	local modelo = Instance.new("Model")
	modelo.Name = nome

	local T = CONFIG.TAMANHO_ARENA
	local H = CONFIG.ALTURA_PAREDE

	local chao = criarParte("Chao", Vector3.new(T, 1, T), centro, modelo)
	chao.Color = corDoChao
	chao.Material = Enum.Material.Grass

	-- Paredes de vidro pra bola (e você) não caírem pra fora
	local function parede(deslocamento, tamanho)
		local p = criarParte("Parede", tamanho, centro + deslocamento, modelo)
		p.Transparency = 0.8
		p.Color = Color3.fromRGB(150, 210, 255)
		p.Material = Enum.Material.Glass
	end
	parede(Vector3.new(T / 2 + 0.5, H / 2, 0), Vector3.new(1, H, T))
	parede(Vector3.new(-T / 2 - 0.5, H / 2, 0), Vector3.new(1, H, T))
	parede(Vector3.new(0, H / 2, T / 2 + 0.5), Vector3.new(T, H, 1))
	parede(Vector3.new(0, H / 2, -T / 2 - 0.5), Vector3.new(T, H, 1))

	local teto = criarParte("Teto", Vector3.new(T, 1, T), centro + Vector3.new(0, H, 0), modelo)
	teto.Transparency = 1

	-- Sombra que mostra onde a bola vai cair
	local sombra = Instance.new("Part")
	sombra.Name = "Sombra"
	sombra.Shape = Enum.PartType.Cylinder
	sombra.Size = Vector3.new(0.2, 5, 5)
	sombra.Anchored = true
	sombra.CanCollide = false
	sombra.CanTouch = false
	sombra.CanQuery = false
	sombra.Color = Color3.new(0, 0, 0)
	sombra.Transparency = 0.55
	sombra.Material = Enum.Material.SmoothPlastic
	sombra.CFrame = CFrame.new(centro + Vector3.new(0, 0.6, 0)) * CFrame.Angles(0, 0, math.rad(90))
	sombra.Parent = modelo

	modelo.Parent = pastaArenas

	local arena = {
		modelo = modelo,
		chao = chao,
		sombra = sombra,
		centro = centro,
		bola = nil,
		jogadores = {},
		toques = 0,
		ativa = false,
		ultimoToque = 0,
		online = online,
		rodada = 0,
	}
	todasArenas[arena] = true
	return arena
end

local arenaOnline = criarArena(
	"ArenaOnline",
	Vector3.new(0, CONFIG.ALTURA_DAS_ARENAS, 0),
	Color3.fromRGB(70, 160, 255),
	true
)

---------------------------------------------------------------------
-- Avisos pros jogadores
---------------------------------------------------------------------
local function avisar(arena, dados)
	dados.toques = dados.toques or arena.toques
	dados.modo = arena.online and "online" or "solo"
	dados.jogadores = #arena.jogadores
	for _, p in ipairs(arena.jogadores) do
		Atualizar:FireClient(p, dados)
	end
end

---------------------------------------------------------------------
-- A bola
---------------------------------------------------------------------
local aoTocar -- declarada aqui, escrita mais pra baixo

local function ajustarAntigravidade(arena)
	local bola = arena.bola
	if not bola then
		return
	end
	-- Quanto mais toques, mais rápido a bola cai
	local fator = math.max(CONFIG.ANTIGRAVIDADE_MINIMA, CONFIG.ANTIGRAVIDADE_INICIAL - arena.toques * 0.006)
	local forca = bola:FindFirstChild("Antigravidade")
	if forca then
		forca.Force = Vector3.new(0, bola:GetMass() * workspace.Gravity * fator, 0)
	end
end

local function criarBola(arena)
	if arena.bola then
		arena.bola:Destroy()
	end

	local bola = Instance.new("Part")
	bola.Name = "Bola"
	bola.Shape = Enum.PartType.Ball
	bola.Size = Vector3.one * CONFIG.TAMANHO_BOLA
	bola.Material = Enum.Material.Neon
	bola.Color = Color3.fromRGB(255, 200, 0)
	bola.CustomPhysicalProperties = PhysicalProperties.new(0.3, 0.3, 0.6)
	bola.Position = arena.centro + Vector3.new(0, 25, 0)
	bola.Anchored = true

	local anexo = Instance.new("Attachment")
	anexo.Parent = bola

	local forca = Instance.new("VectorForce")
	forca.Name = "Antigravidade"
	forca.Attachment0 = anexo
	forca.RelativeTo = Enum.ActuatorRelativeTo.World
	forca.ApplyAtCenterOfMass = true
	forca.Parent = bola

	local brilho = Instance.new("PointLight")
	brilho.Color = bola.Color
	brilho.Range = 14
	brilho.Parent = bola

	bola.Parent = arena.modelo
	arena.bola = bola
	ajustarAntigravidade(arena)

	bola.Touched:Connect(function(outra)
		aoTocar(arena, bola, outra)
	end)
	return bola
end

local function comecarRodada(arena)
	arena.rodada += 1
	local minhaRodada = arena.rodada
	arena.ativa = false
	arena.toques = 0
	local bola = criarBola(arena)

	for numero = 3, 1, -1 do
		if arena.rodada ~= minhaRodada or #arena.jogadores == 0 then
			return
		end
		avisar(arena, { estado = "contagem", numero = numero })
		task.wait(1)
	end
	if arena.rodada ~= minhaRodada or #arena.jogadores == 0 then
		return
	end

	bola.Anchored = false
	bola:SetNetworkOwner(nil) -- o servidor cuida da bola, assim ninguém trapaceia
	bola.AssemblyLinearVelocity = Vector3.new(0, 8, 0)
	arena.ativa = true
	avisar(arena, { estado = "jogando" })
end

local function bolaCaiu(arena)
	if not arena.ativa then
		return
	end
	arena.ativa = false

	if arena.bola then
		arena.bola.Anchored = true
		arena.bola.Color = Color3.fromRGB(255, 60, 60)
	end

	for _, p in ipairs(arena.jogadores) do
		local recordeNovo = salvarRecorde(p, arena.toques)
		Atualizar:FireClient(p, {
			estado = "caiu",
			toques = arena.toques,
			novoRecorde = recordeNovo,
			modo = arena.online and "online" or "solo",
			jogadores = #arena.jogadores,
		})
	end

	local minhaRodada = arena.rodada
	task.delay(CONFIG.SEGUNDOS_PRA_RECOMECAR, function()
		if arena.rodada == minhaRodada and #arena.jogadores > 0 then
			comecarRodada(arena)
		end
	end)
end

local function baterNaBola(arena, player)
	local bola = arena.bola
	if not arena.ativa or not bola then
		return
	end

	local agora = os.clock()
	if agora - arena.ultimoToque < CONFIG.ESPERA_ENTRE_TOQUES then
		return
	end
	arena.ultimoToque = agora

	-- A bola vai pro lado contrário de quem bateu
	local lado = Vector3.zero
	local raiz = player.Character and player.Character:FindFirstChild("HumanoidRootPart")
	if raiz then
		local diferenca = bola.Position - raiz.Position
		diferenca = Vector3.new(diferenca.X, 0, diferenca.Z)
		if diferenca.Magnitude > 0.1 then
			lado = diferenca.Unit * 0.6
		end
	end

	-- Um pouco de bagunça pra ficar divertido
	local bagunca = Vector3.new(math.random() - 0.5, 0, math.random() - 0.5) * 1.6

	-- Se estiver perto da parede, puxa de volta pro meio
	local proMeio = (arena.centro - bola.Position) * Vector3.new(1, 0, 1) / (CONFIG.TAMANHO_ARENA / 2)

	local horizontal = (lado + bagunca + proMeio) * CONFIG.FORCA_PRO_LADO
	bola.AssemblyLinearVelocity = Vector3.new(horizontal.X, CONFIG.FORCA_PRA_CIMA, horizontal.Z)

	arena.toques += 1
	ajustarAntigravidade(arena)

	-- A bola muda de cor a cada 10 toques
	local cores = {
		Color3.fromRGB(255, 200, 0),
		Color3.fromRGB(0, 230, 120),
		Color3.fromRGB(0, 180, 255),
		Color3.fromRGB(190, 90, 255),
		Color3.fromRGB(255, 90, 180),
	}
	local cor = cores[(math.floor(arena.toques / 10) % #cores) + 1]
	bola.Color = cor
	local brilho = bola:FindFirstChildOfClass("PointLight")
	if brilho then
		brilho.Color = cor
	end

	avisar(arena, { estado = "jogando", quemBateu = player.DisplayName })
end

aoTocar = function(arena, bola, outra)
	if not arena.ativa or arena.bola ~= bola then
		return
	end
	if outra == arena.chao then
		bolaCaiu(arena)
		return
	end
	-- Encostou no corpo de um jogador? Conta como toque (cabeçada!)
	local personagem = outra:FindFirstAncestorOfClass("Model")
	local player = personagem and Players:GetPlayerFromCharacter(personagem)
	if player and arenaDoJogador[player] == arena then
		baterNaBola(arena, player)
	end
end

-- Sombra seguindo a bola e segurança caso a bola atravesse o chão
RunService.Heartbeat:Connect(function()
	for arena in pairs(todasArenas) do
		local bola = arena.bola
		if bola and bola.Parent then
			local topoDoChao = arena.chao.Position.Y + 0.5
			arena.sombra.Position = Vector3.new(bola.Position.X, topoDoChao + 0.1, bola.Position.Z)
			if arena.ativa and bola.Position.Y < topoDoChao - 3 then
				bolaCaiu(arena)
			end
		end
	end
end)

---------------------------------------------------------------------
-- Entrar e sair das arenas
---------------------------------------------------------------------
local function levarPraArena(player, arena)
	local personagem = player.Character
	if personagem then
		local onde = arena.centro + Vector3.new(math.random(-12, 12), 4, math.random(-12, 12))
		personagem:PivotTo(CFrame.new(onde, arena.centro + Vector3.new(0, 4, 0)))
	end
end

local function sairDaArena(player)
	local arena = arenaDoJogador[player]
	if not arena then
		return
	end
	arenaDoJogador[player] = nil

	local i = table.find(arena.jogadores, player)
	if i then
		table.remove(arena.jogadores, i)
	end

	if arena.online then
		jogandoOnline.Value = #arena.jogadores
		if #arena.jogadores == 0 then
			arena.rodada += 1
			arena.ativa = false
			if arena.bola then
				arena.bola:Destroy()
				arena.bola = nil
			end
		else
			avisar(arena, { estado = arena.ativa and "jogando" or "esperando" })
		end
	else
		arena.rodada += 1
		todasArenas[arena] = nil
		arena.modelo:Destroy()
	end
end

Entrar.OnServerEvent:Connect(function(player, modo)
	if modo ~= "solo" and modo ~= "online" then
		return
	end
	sairDaArena(player)

	local arena
	if modo == "online" then
		arena = arenaOnline
	else
		contadorSolo += 1
		local centro = Vector3.new(500 + contadorSolo * 120, CONFIG.ALTURA_DAS_ARENAS, 0)
		arena = criarArena("Solo_" .. player.Name, centro, Color3.fromRGB(90, 200, 90), false)
	end

	table.insert(arena.jogadores, player)
	arenaDoJogador[player] = arena
	levarPraArena(player, arena)

	if arena.online then
		jogandoOnline.Value = #arena.jogadores
	end

	if #arena.jogadores == 1 then
		task.spawn(comecarRodada, arena)
	else
		-- Chegou no meio de uma rodada online: entra no jogo que já está rolando
		avisar(arena, { estado = arena.ativa and "jogando" or "esperando" })
	end
end)

Sair.OnServerEvent:Connect(function(player)
	if arenaDoJogador[player] then
		sairDaArena(player)
		player:LoadCharacter() -- volta pro lugar onde nasce
	end
end)

Bater.OnServerEvent:Connect(function(player)
	local arena = arenaDoJogador[player]
	if not arena or not arena.bola then
		return
	end
	local raiz = player.Character and player.Character:FindFirstChild("HumanoidRootPart")
	if raiz and (raiz.Position - arena.bola.Position).Magnitude <= CONFIG.ALCANCE_DO_CLIQUE then
		baterNaBola(arena, player)
	end
end)

local function jogadorChegou(player)
	carregarRecorde(player)
	player.CharacterAdded:Connect(function()
		-- Se morreu durante o jogo, renasce dentro da arena
		local arena = arenaDoJogador[player]
		if arena then
			task.wait(0.2)
			levarPraArena(player, arena)
		end
	end)
end

Players.PlayerAdded:Connect(jogadorChegou)
for _, player in ipairs(Players:GetPlayers()) do
	task.spawn(jogadorChegou, player) -- quem entrou antes deste script começar
end

Players.PlayerRemoving:Connect(sairDaArena)
