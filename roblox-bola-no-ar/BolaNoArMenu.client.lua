--[[
	BOLA NO AR ⚽ — parte do JOGADOR (menu e placar)
	Coloque este LocalScript dentro de StarterPlayer > StarterPlayerScripts.

	Ele monta sozinho:
	- O MENU: Jogar Sozinho, Jogar Online, Ranking e Como Jogar.
	- O PLACAR: toques, recorde, botão BATER e botão MENU.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")

local jogador = Players.LocalPlayer
local pasta = ReplicatedStorage:WaitForChild("BolaNoAr")
local Entrar = pasta:WaitForChild("Entrar")
local Bater = pasta:WaitForChild("Bater")
local Sair = pasta:WaitForChild("Sair")
local Atualizar = pasta:WaitForChild("Atualizar")
local PegarRanking = pasta:WaitForChild("PegarRanking")
local jogandoOnline = pasta:WaitForChild("JogandoOnline")

local FONTE = Enum.Font.FredokaOne
local AMARELO = Color3.fromRGB(255, 200, 0)
local AZUL_ESCURO = Color3.fromRGB(20, 30, 70)

---------------------------------------------------------------------
-- Ajudantes pra criar a tela
---------------------------------------------------------------------
local function novo(classe, props, pai)
	local coisa = Instance.new(classe)
	for nome, valor in pairs(props) do
		coisa[nome] = valor
	end
	coisa.Parent = pai
	return coisa
end

local function arredondar(coisa, raio)
	novo("UICorner", { CornerRadius = UDim.new(0, raio or 16) }, coisa)
end

local function contorno(coisa, cor, grossura)
	novo("UIStroke", {
		Color = cor or Color3.new(0, 0, 0),
		Thickness = grossura or 3,
		ApplyStrokeMode = Enum.ApplyStrokeMode.Border,
	}, coisa)
end

local function texto(pai, props)
	local t = novo("TextLabel", {
		BackgroundTransparency = 1,
		Font = FONTE,
		TextColor3 = Color3.new(1, 1, 1),
		TextScaled = true,
		Size = UDim2.new(1, 0, 0, 40),
	}, pai)
	novo("UIStroke", { Thickness = 2, Color = Color3.new(0, 0, 0) }, t)
	for nome, valor in pairs(props) do
		t[nome] = valor
	end
	return t
end

local function botao(pai, rotulo, cor, aoClicar)
	local b = novo("TextButton", {
		Text = rotulo,
		Font = FONTE,
		TextScaled = true,
		TextColor3 = Color3.new(1, 1, 1),
		BackgroundColor3 = cor,
		Size = UDim2.new(1, 0, 0, 60),
		AutoButtonColor = true,
	}, pai)
	arredondar(b, 14)
	contorno(b, Color3.new(0, 0, 0), 3)
	novo("UIPadding", {
		PaddingTop = UDim.new(0, 10),
		PaddingBottom = UDim.new(0, 10),
		PaddingLeft = UDim.new(0, 12),
		PaddingRight = UDim.new(0, 12),
	}, b)
	local escala = novo("UIScale", { Scale = 1 }, b)
	b.MouseEnter:Connect(function()
		TweenService:Create(escala, TweenInfo.new(0.12), { Scale = 1.05 }):Play()
	end)
	b.MouseLeave:Connect(function()
		TweenService:Create(escala, TweenInfo.new(0.12), { Scale = 1 }):Play()
	end)
	b.Activated:Connect(aoClicar)
	return b
end

local function pular(coisa)
	local escala = coisa:FindFirstChildOfClass("UIScale") or novo("UIScale", {}, coisa)
	escala.Scale = 1.35
	TweenService:Create(escala, TweenInfo.new(0.25, Enum.EasingStyle.Back), { Scale = 1 }):Play()
end

---------------------------------------------------------------------
-- A tela
---------------------------------------------------------------------
local tela = novo("ScreenGui", {
	Name = "BolaNoArTela",
	ResetOnSpawn = false,
	IgnoreGuiInset = true,
	ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
}, jogador:WaitForChild("PlayerGui"))

---------------------------------------------------------------------
-- MENU
---------------------------------------------------------------------
local menu = novo("Frame", {
	Name = "Menu",
	Size = UDim2.fromScale(1, 1),
	BackgroundColor3 = Color3.new(1, 1, 1),
}, tela)
novo("UIGradient", {
	Rotation = 90,
	Color = ColorSequence.new(Color3.fromRGB(60, 150, 255), Color3.fromRGB(30, 40, 120)),
}, menu)

local caixa = novo("Frame", {
	AnchorPoint = Vector2.new(0.5, 0.5),
	Position = UDim2.fromScale(0.5, 0.5),
	Size = UDim2.new(0.9, 0, 0.9, 0),
	BackgroundTransparency = 1,
}, menu)
novo("UISizeConstraint", { MaxSize = Vector2.new(420, 640) }, caixa)

-- Três "páginas" dentro do menu: início, ranking e como jogar
local function pagina(nome)
	local p = novo("Frame", {
		Name = nome,
		Size = UDim2.fromScale(1, 1),
		BackgroundTransparency = 1,
		Visible = false,
	}, caixa)
	novo("UIListLayout", {
		Padding = UDim.new(0, 12),
		HorizontalAlignment = Enum.HorizontalAlignment.Center,
		VerticalAlignment = Enum.VerticalAlignment.Center,
		SortOrder = Enum.SortOrder.LayoutOrder,
	}, p)
	return p
end

local inicio = pagina("Inicio")
local paginaRanking = pagina("Ranking")
local paginaComoJogar = pagina("ComoJogar")

local function mostrarPagina(qual)
	inicio.Visible = qual == inicio
	paginaRanking.Visible = qual == paginaRanking
	paginaComoJogar.Visible = qual == paginaComoJogar
end

-- Início
local titulo = texto(inicio, {
	Text = "⚽ BOLA NO AR",
	TextColor3 = AMARELO,
	Size = UDim2.new(1, 0, 0, 80),
	LayoutOrder = 1,
})
texto(inicio, {
	Text = "Não deixe a bola cair no chão!",
	Size = UDim2.new(1, 0, 0, 30),
	LayoutOrder = 2,
})
novo("Frame", { Size = UDim2.new(1, 0, 0, 10), BackgroundTransparency = 1, LayoutOrder = 3 }, inicio)

-- O título fica balançando
task.spawn(function()
	local escala = novo("UIScale", {}, titulo)
	while true do
		TweenService:Create(escala, TweenInfo.new(0.8, Enum.EasingStyle.Sine), { Scale = 1.07 }):Play()
		task.wait(0.8)
		TweenService:Create(escala, TweenInfo.new(0.8, Enum.EasingStyle.Sine), { Scale = 1 }):Play()
		task.wait(0.8)
	end
end)

-- O placar é criado mais pra baixo; aqui só guardamos a função de começar
local comecarJogo

botao(inicio, "🎮 JOGAR SOZINHO", Color3.fromRGB(40, 190, 90), function()
	comecarJogo("solo")
end).LayoutOrder = 4

local botaoOnline = botao(inicio, "🌍 JOGAR ONLINE", Color3.fromRGB(255, 140, 0), function()
	comecarJogo("online")
end)
botaoOnline.LayoutOrder = 5

local function atualizarBotaoOnline()
	local n = jogandoOnline.Value
	if n == 0 then
		botaoOnline.Text = "🌍 JOGAR ONLINE (ninguém ainda)"
	elseif n == 1 then
		botaoOnline.Text = "🌍 JOGAR ONLINE (1 jogando)"
	else
		botaoOnline.Text = "🌍 JOGAR ONLINE (" .. n .. " jogando)"
	end
end
jogandoOnline.Changed:Connect(atualizarBotaoOnline)
atualizarBotaoOnline()

local listaRanking -- criada na página de ranking

local function carregarRanking()
	for _, filho in ipairs(listaRanking:GetChildren()) do
		if filho:IsA("TextLabel") then
			filho:Destroy()
		end
	end
	local carregando = texto(listaRanking, { Text = "Carregando...", Size = UDim2.new(1, 0, 0, 30) })

	local ok, lista = pcall(function()
		return PegarRanking:InvokeServer()
	end)
	carregando:Destroy()

	if not ok or #lista == 0 then
		texto(listaRanking, {
			Text = "Ninguém no ranking ainda. Seja o primeiro!",
			Size = UDim2.new(1, 0, 0, 30),
		})
		return
	end

	local medalhas = { "🥇", "🥈", "🥉" }
	for _, item in ipairs(lista) do
		local medalha = medalhas[item.posicao] or (item.posicao .. ".")
		local linha = texto(listaRanking, {
			Text = medalha .. " " .. item.nome .. " — " .. item.toques .. " toques",
			Size = UDim2.new(1, 0, 0, 32),
			TextXAlignment = Enum.TextXAlignment.Left,
			LayoutOrder = item.posicao,
		})
		if item.nome == jogador.Name then
			linha.TextColor3 = AMARELO
		end
	end
end

botao(inicio, "🏆 RANKING", Color3.fromRGB(150, 80, 230), function()
	mostrarPagina(paginaRanking)
	carregarRanking()
end).LayoutOrder = 6

botao(inicio, "❓ COMO JOGAR", Color3.fromRGB(0, 160, 220), function()
	mostrarPagina(paginaComoJogar)
end).LayoutOrder = 7

local meuRecordeNoMenu = texto(inicio, {
	Text = "Seu recorde: 0",
	Size = UDim2.new(1, 0, 0, 30),
	LayoutOrder = 8,
})

-- Ranking
texto(paginaRanking, {
	Text = "🏆 MELHORES DO MUNDO",
	TextColor3 = AMARELO,
	Size = UDim2.new(1, 0, 0, 60),
	LayoutOrder = 1,
})
listaRanking = novo("Frame", {
	Size = UDim2.new(1, 0, 0, 380),
	BackgroundColor3 = AZUL_ESCURO,
	BackgroundTransparency = 0.3,
	LayoutOrder = 2,
}, paginaRanking)
arredondar(listaRanking, 16)
novo("UIListLayout", { Padding = UDim.new(0, 4), SortOrder = Enum.SortOrder.LayoutOrder }, listaRanking)
novo("UIPadding", {
	PaddingTop = UDim.new(0, 12),
	PaddingLeft = UDim.new(0, 14),
	PaddingRight = UDim.new(0, 14),
}, listaRanking)
botao(paginaRanking, "⬅ VOLTAR", Color3.fromRGB(120, 120, 140), function()
	mostrarPagina(inicio)
end).LayoutOrder = 3

-- Como jogar
texto(paginaComoJogar, {
	Text = "❓ COMO JOGAR",
	TextColor3 = AMARELO,
	Size = UDim2.new(1, 0, 0, 60),
	LayoutOrder = 1,
})
local explicacao = novo("TextLabel", {
	Size = UDim2.new(1, 0, 0, 380),
	BackgroundColor3 = AZUL_ESCURO,
	BackgroundTransparency = 0.3,
	Font = Enum.Font.GothamBold,
	TextColor3 = Color3.new(1, 1, 1),
	TextSize = 18,
	TextWrapped = true,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextYAlignment = Enum.TextYAlignment.Top,
	LayoutOrder = 2,
	Text = table.concat({
		"⚽ A bola cai do céu. Ela NÃO pode encostar no chão!",
		"",
		"🖱 Chegue perto e CLIQUE (ou aperte E) pra bater nela.",
		"📱 No celular, aperte o botão BATER.",
		"🤕 Encostar na bola com o corpo também conta: dá até pra cabecear!",
		"",
		"⚫ A sombra no chão mostra onde a bola vai cair.",
		"🌈 A cada 10 toques a bola muda de cor e fica mais rápida.",
		"",
		"🎮 Sozinho: uma arena só sua.",
		"🌍 Online: todo mundo do servidor joga junto com a mesma bola. O recorde é do time todo!",
	}, "\n"),
}, paginaComoJogar)
arredondar(explicacao, 16)
novo("UIPadding", {
	PaddingTop = UDim.new(0, 14),
	PaddingLeft = UDim.new(0, 14),
	PaddingRight = UDim.new(0, 14),
}, explicacao)
botao(paginaComoJogar, "⬅ VOLTAR", Color3.fromRGB(120, 120, 140), function()
	mostrarPagina(inicio)
end).LayoutOrder = 3

mostrarPagina(inicio)

---------------------------------------------------------------------
-- PLACAR (aparece durante o jogo)
---------------------------------------------------------------------
local placar = novo("Frame", {
	Name = "Placar",
	Size = UDim2.fromScale(1, 1),
	BackgroundTransparency = 1,
	Visible = false,
}, tela)

local caixaToques = novo("Frame", {
	AnchorPoint = Vector2.new(0.5, 0),
	Position = UDim2.new(0.5, 0, 0, 50),
	Size = UDim2.new(0, 240, 0, 110),
	BackgroundColor3 = AZUL_ESCURO,
	BackgroundTransparency = 0.25,
}, placar)
arredondar(caixaToques, 18)
contorno(caixaToques, AMARELO, 3)

local textoToques = texto(caixaToques, {
	Text = "0",
	TextColor3 = AMARELO,
	Position = UDim2.new(0, 0, 0, 4),
	Size = UDim2.new(1, 0, 0, 60),
})
local textoRecorde = texto(caixaToques, {
	Text = "Recorde: 0",
	Position = UDim2.new(0, 0, 0, 62),
	Size = UDim2.new(1, 0, 0, 22),
})
local textoModo = texto(caixaToques, {
	Text = "",
	Position = UDim2.new(0, 0, 0, 84),
	Size = UDim2.new(1, 0, 0, 20),
	TextColor3 = Color3.fromRGB(180, 220, 255),
})

local mensagem = texto(placar, {
	AnchorPoint = Vector2.new(0.5, 0.5),
	Position = UDim2.fromScale(0.5, 0.42),
	Size = UDim2.new(0.8, 0, 0, 120),
	Text = "",
	Visible = false,
})
novo("UISizeConstraint", { MaxSize = Vector2.new(600, 120) }, mensagem)

local quemBateuTexto = texto(placar, {
	AnchorPoint = Vector2.new(0.5, 0),
	Position = UDim2.new(0.5, 0, 0, 168),
	Size = UDim2.new(0, 300, 0, 26),
	Text = "",
	TextColor3 = Color3.fromRGB(200, 255, 200),
})

local botaoMenu = botao(placar, "☰ MENU", Color3.fromRGB(120, 120, 140), function()
	Sair:FireServer()
	placar.Visible = false
	menu.Visible = true
	mostrarPagina(inicio)
end)
botaoMenu.AnchorPoint = Vector2.new(0, 0)
botaoMenu.Position = UDim2.new(0, 16, 0, 50)
botaoMenu.Size = UDim2.new(0, 130, 0, 50)

local ultimoClique = 0
local function tentarBater()
	if not placar.Visible then
		return
	end
	local agora = os.clock()
	if agora - ultimoClique < 0.15 then
		return
	end
	ultimoClique = agora
	Bater:FireServer()
end

local botaoBater = botao(placar, "⚽ BATER", Color3.fromRGB(230, 60, 60), tentarBater)
botaoBater.AnchorPoint = Vector2.new(1, 1)
botaoBater.Position = UDim2.new(1, -24, 1, -140)
botaoBater.Size = UDim2.new(0, 140, 0, 140)
arredondar(botaoBater, 70)
botaoBater.Visible = UserInputService.TouchEnabled -- só aparece no celular/tablet

-- Clique do mouse ou tecla E também batem na bola
UserInputService.InputBegan:Connect(function(entrada, jaUsado)
	if jaUsado then
		return
	end
	if entrada.UserInputType == Enum.UserInputType.MouseButton1
		or entrada.KeyCode == Enum.KeyCode.E
		or entrada.KeyCode == Enum.KeyCode.ButtonR2
	then
		tentarBater()
	end
end)

---------------------------------------------------------------------
-- Recorde
---------------------------------------------------------------------
local function atualizarRecorde()
	local leaderstats = jogador:FindFirstChild("leaderstats")
	local recorde = leaderstats and leaderstats:FindFirstChild("Recorde")
	local valor = recorde and recorde.Value or 0
	textoRecorde.Text = "Recorde: " .. valor
	meuRecordeNoMenu.Text = "Seu recorde: " .. valor .. " toques"
end

task.spawn(function()
	local leaderstats = jogador:WaitForChild("leaderstats", 30)
	local recorde = leaderstats and leaderstats:WaitForChild("Recorde", 10)
	if recorde then
		recorde.Changed:Connect(atualizarRecorde)
		atualizarRecorde()
	end
end)

---------------------------------------------------------------------
-- Começar e receber avisos do servidor
---------------------------------------------------------------------
comecarJogo = function(modo)
	menu.Visible = false
	placar.Visible = true
	textoToques.Text = "0"
	textoModo.Text = modo == "online" and "🌍 Online" or "🎮 Sozinho"
	mensagem.Visible = true
	mensagem.Text = "Preparando..."
	Entrar:FireServer(modo)
end

local escondeQuemBateu = 0

Atualizar.OnClientEvent:Connect(function(dados)
	if not placar.Visible then
		return
	end

	if dados.modo == "online" then
		textoModo.Text = "🌍 Online — " .. dados.jogadores .. (dados.jogadores == 1 and " jogador" or " jogadores")
	end

	if dados.estado == "contagem" then
		mensagem.Visible = true
		mensagem.TextColor3 = AMARELO
		mensagem.Text = tostring(dados.numero)
		textoToques.Text = "0"
		pular(mensagem)
	elseif dados.estado == "jogando" then
		mensagem.Visible = false
		if textoToques.Text ~= tostring(dados.toques) then
			textoToques.Text = tostring(dados.toques)
			pular(textoToques)
		end
		if dados.quemBateu and dados.modo == "online" then
			quemBateuTexto.Text = dados.quemBateu .. " bateu!"
			escondeQuemBateu += 1
			local minhaVez = escondeQuemBateu
			task.delay(1.2, function()
				if minhaVez == escondeQuemBateu then
					quemBateuTexto.Text = ""
				end
			end)
		end
	elseif dados.estado == "caiu" then
		mensagem.Visible = true
		mensagem.TextColor3 = Color3.fromRGB(255, 90, 90)
		local frase = "A BOLA CAIU! 😱\n" .. dados.toques .. " toques"
		if dados.novoRecorde then
			frase = "🎉 NOVO RECORDE! 🎉\n" .. dados.toques .. " toques"
			mensagem.TextColor3 = AMARELO
		end
		mensagem.Text = frase
		pular(mensagem)
	elseif dados.estado == "esperando" then
		mensagem.Visible = true
		mensagem.TextColor3 = Color3.new(1, 1, 1)
		mensagem.Text = "Esperando a próxima rodada..."
	end
end)
