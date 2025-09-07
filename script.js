// Aguarda o HTML ser completamente carregado para executar o script
document.addEventListener("DOMContentLoaded", () => {
  // Seleciona os elementos do HTML com os quais vamos interagir
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskModal = document.getElementById("taskModal");
  const closeModalBtn = document.querySelector(".close-btn");
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("task-list");
  const modalTitle = document.getElementById("modalTitle");
  const taskIdInput = document.getElementById("taskId");
  const filterBtns = document.querySelectorAll(".filter-btn");

  // ADICIONE ESTAS DUAS LINHAS
  const audioOverlay = document.getElementById("audio-activation-overlay");
  const activateAudioBtn = document.getElementById("activateAudioBtn");

  // Variável para armazenar nossas tarefas e o filtro atual
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all";

  const alarmSound = new Audio(
    "https://www.soundjay.com/buttons/sounds/beep-07a.mp3"
  );

  // ADICIONE ESTE BLOCO DE CÓDIGO
  // Event listener para o botão que ativa o áudio
  activateAudioBtn.addEventListener("click", () => {
    // Toca e pausa o som imediatamente. Isso é o suficiente para o navegador "permitir" o áudio.
    alarmSound.play();
    alarmSound.pause();
    alarmSound.currentTime = 0;

    // Esconde a tela de ativação
    audioOverlay.style.display = "none";
  });
  // --- FUNÇÕES DE LÓGICA ---

  /**
   * Salva as tarefas no localStorage e renderiza a lista novamente.
   */
  const saveAndRender = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
  };

  /**
   * Renderiza (desenha) as tarefas na tela com base no filtro atual.
   */
  const renderTasks = () => {
    // Limpa a lista de tarefas atual para não duplicar
    taskList.innerHTML = "";

    // Filtra as tarefas de acordo com o filtro selecionado
    const filteredTasks = tasks.filter((task) => {
      if (currentFilter === "pending") return !task.completed;
      if (currentFilter === "completed") return task.completed;
      if (currentFilter === "favorites") return task.favorite;
      return true; // para o filtro 'all'
    });

    // Se não houver tarefas, mostra uma mensagem
    if (filteredTasks.length === 0) {
      taskList.innerHTML = "<li>Nenhuma tarefa encontrada.</li>";
      return;
    }

    // Cria e adiciona cada tarefa como um item na lista (<li>)
    filteredTasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item";
      li.dataset.id = task.id; // Atribui um ID para fácil identificação

      // Adiciona classes CSS com base no status da tarefa
      if (task.completed) li.classList.add("completed");

      // Lógica simples para borda colorida (pode ser aprimorada)
      if (!task.completed) {
        li.classList.add("pending");
      }

      li.innerHTML = `
                <div class="task-status ${
                  task.completed ? "completed" : ""
                }" data-action="toggle">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ""}
                </div>
                <div class="task-info">
                    <h3>${task.name}</h3>
                    <div class="task-details">
                        <span><i class="far fa-clock"></i>${task.time}</span>
                        <span><i class="far fa-calendar-alt"></i>${
                          task.frequency
                        }</span>
                    </div>
                </div>
                <div class="task-actions">
                    <i class="fas fa-star favorite ${
                      task.favorite ? "is-favorite" : ""
                    }" data-action="favorite"></i>
                    <i class="fas fa-pencil-alt" data-action="edit"></i>
                    <i class="fas fa-trash-alt" data-action="delete"></i>
                </div>
            `;
      taskList.appendChild(li);
    });
  };

  /**
   * Mostra o modal para adicionar ou editar uma tarefa.
   * @param {object | null} task - A tarefa a ser editada, ou null para criar uma nova.
   */
  const showModal = (task = null) => {
    taskForm.reset(); // Limpa o formulário
    if (task) {
      // Se está editando, preenche o formulário com os dados da tarefa
      modalTitle.textContent = "Editar Tarefa";
      taskIdInput.value = task.id;
      document.getElementById("taskName").value = task.name;
      document.getElementById("taskTime").value = task.time;
      document.getElementById("taskFrequency").value = task.frequency;
    } else {
      // Se está adicionando, limpa os campos
      modalTitle.textContent = "Adicionar Tarefa";
      taskIdInput.value = "";
    }
    taskModal.style.display = "block";
  };

  /**
   * Esconde o modal.
   */
  const hideModal = () => {
    taskModal.style.display = "none";
  };

  // --- EVENT LISTENERS (Ouvintes de Ações do Usuário) ---

  // Abre o modal ao clicar em "Adicionar Tarefa"
  addTaskBtn.addEventListener("click", () => showModal());

  // Fecha o modal ao clicar no 'X'
  closeModalBtn.addEventListener("click", hideModal);

  // Fecha o modal se o usuário clicar fora dele
  window.addEventListener("click", (e) => {
    if (e.target === taskModal) {
      hideModal();
    }
  });

  // Lida com o envio do formulário (adicionar ou editar tarefa)
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    // Pega os valores do formulário
    const id = taskIdInput.value;
    const name = document.getElementById("taskName").value.trim();
    const time = document.getElementById("taskTime").value;
    const frequency = document.getElementById("taskFrequency").value;

    if (name === "" || time === "") return; // Validação simples

    if (id) {
      // Se tem um ID, está editando uma tarefa existente
      const task = tasks.find((t) => t.id == id);
      task.name = name;
      task.time = time;
      task.frequency = frequency;
    } else {
      // Se não tem ID, cria uma nova tarefa
      const newTask = {
        id: Date.now(), // ID único baseado no tempo atual
        name,
        time,
        frequency,
        completed: false,
        favorite: false,
      };
      tasks.push(newTask);
    }

    hideModal();
    saveAndRender();
  });

  // Usa "event delegation" para lidar com cliques nos botões das tarefas
  // (completar, favoritar, editar, deletar)
  taskList.addEventListener("click", (e) => {
    const target = e.target;
    const action = target.dataset.action || target.parentElement.dataset.action;
    if (!action) return;

    const taskItem = target.closest(".task-item");
    const taskId = taskItem.dataset.id;
    const task = tasks.find((t) => t.id == taskId);

    switch (action) {
      case "toggle":
        task.completed = !task.completed;
        break;
      case "favorite":
        task.favorite = !task.favorite;
        break;
      case "edit":
        showModal(task);
        break;
      case "delete":
        if (confirm("Tem certeza que deseja deletar esta tarefa?")) {
          tasks = tasks.filter((t) => t.id != taskId);
        }
        break;
    }
    saveAndRender();
  });

  // Lida com a troca de filtros (Todas, Pendentes, etc.)
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove a classe 'active' de todos os botões
      filterBtns.forEach((b) => b.classList.remove("active"));
      // Adiciona a classe 'active' ao botão clicado
      btn.classList.add("active");
      // Atualiza o filtro atual
      currentFilter = btn.dataset.filter;
      // Renderiza as tarefas novamente com o novo filtro
      renderTasks();
    });
  });

  // --- INICIALIZAÇÃO ---
  // Renderiza as tarefas pela primeira vez quando a página carrega
  // ... adicione este código antes da linha final });

  /**
   * Verifica a hora atual e dispara um alarme para tarefas pendentes correspondentes.
   */
  const checkAlarms = () => {
    const now = new Date();
    // Formata a hora atual para o formato HH:MM (ex: 14:30)
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    // Percorre todas as tarefas para verificar
    tasks.forEach((task) => {
      // A chave de verificação usa o ID da tarefa e a data atual
      // para garantir que o alarme toque apenas uma vez por dia para cada tarefa.
      const notificationKey = `notified_${
        task.id
      }_${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

      // CONDIÇÕES PARA O ALARME TOCAR:
      // 1. A tarefa não pode estar concluída.
      // 2. O horário da tarefa deve ser igual ao horário atual.
      // 3. O alarme para esta tarefa ainda não pode ter tocado hoje (verificando no sessionStorage).
      if (
        !task.completed &&
        task.time === currentTime &&
        !sessionStorage.getItem(notificationKey)
      ) {
        console.log(`Disparando alarme para: ${task.name}`);

        // Tenta tocar o som
        alarmSound.play().catch((error) => {
          console.error("Não foi possível tocar o som do alarme:", error);
          // Mesmo que o som falhe (alguns navegadores bloqueiam), o alerta visual ainda funciona.
        });

        // Mostra um alerta na tela

        const showNotification = (message) => {
          customNotification.textContent = message;
          customNotification.classList.add("show");
          setTimeout(() => {
            customNotification.classList.remove("show");
          }, 5000); // A notificação some após 5 segundos
        };

        // Marca no sessionStorage que este alarme já tocou hoje.
        // Usamos sessionStorage para que a marcação seja esquecida se o navegador for fechado,
        // permitindo que o alarme toque novamente no dia seguinte.
        sessionStorage.setItem(notificationKey, "true");
      }
    });
  };

  // ... logo após a função checkAlarms

  // Inicia o verificador de alarmes para rodar a cada 10 segundos.
  setInterval(checkAlarms, 10000); // 10000 milissegundos = 10 segundos

  renderTasks();
});
