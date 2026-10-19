const calendarDays = document.getElementById("calendarDays");
    const monthSelect = document.getElementById("month");
    const yearSelect = document.getElementById("year");
    const eventList = document.getElementById("eventList");
    const eventTitle = document.getElementById("eventTitle");
    const eventCategory = document.getElementById("eventCategory");
    const weeklyView = document.getElementById("weeklyView");
    const viewToggle = document.getElementById("viewToggle");

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const today = new Date();
    let selectedDate = new Date(today);
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    const events = JSON.parse(localStorage.getItem("events") || "{}");

    function saveEvents() {
      localStorage.setItem("events", JSON.stringify(events));
    }

    function renderCalendar() {
      monthSelect.innerHTML = months.map((month, index) => 
        `<option value="${index}" ${index === currentMonth ? "selected" : ""}>${month}</option>`
      ).join("");
      yearSelect.innerHTML = Array.from({length: 10}, (_, i) => currentYear + i).map(year => 
        `<option value="${year}" ${year === currentYear ? "selected" : ""}>${year}</option>`
      ).join("");

      let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
      let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      calendarDays.innerHTML = '';
      for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.innerHTML += `<div class="day"></div>`;
      }
      for (let i = 1; i <= daysInMonth; i++) {
        let day = new Date(currentYear, currentMonth, i);
        let dayString = day.toISOString().split('T')[0];

        let dayEvents = events[dayString] || [];
        let dayEventCount = dayEvents.length;

        calendarDays.innerHTML += `
          <div class="day ${dayString === selectedDate.toISOString().split('T')[0] ? 'selected' : ''}" onclick="selectDate('${dayString}')">
            ${i} <span class="event-count">${dayEventCount > 0 ? `(${dayEventCount})` : ''}</span>
          </div>
        `;
      }
    }

    function selectDate(dayString) {
      selectedDate = new Date(dayString);
      renderCalendar();
      renderEvents(dayString);
    }

    function renderEvents(dayString) {
      let dayEvents = events[dayString] || [];
      eventList.innerHTML = dayEvents.map(event => 
        `<div class="event ${event.category.toLowerCase()}">
          <span>${event.title}</span>
          <span class="edit" onclick="editEvent('${dayString}', '${event.title}')">✏️</span>
          <span class="delete" onclick="deleteEvent('${dayString}', '${event.title}')">🗑️</span>
        </div>`
      ).join('');
    }

    function addEvent() {
      const title = eventTitle.value.trim();
      const category = eventCategory.value;
      if (title && selectedDate) {
        const dayString = selectedDate.toISOString().split('T')[0];
        if (!events[dayString]) events[dayString] = [];
        events[dayString].push({ title, category });
        saveEvents();
        renderEvents(dayString);
      }
    }

    function editEvent(dayString, eventTitle) {
      const newTitle = prompt("Edit event title", eventTitle);
      if (newTitle !== null) {
        const dayEvents = events[dayString];
        const event = dayEvents.find(e => e.title === eventTitle);
        event.title = newTitle;
        saveEvents();
        renderEvents(dayString);
      }
    }

    function deleteEvent(dayString, eventTitle) {
      const dayEvents = events[dayString];
      events[dayString] = dayEvents.filter(e => e.title !== eventTitle);
      saveEvents();
      renderEvents(dayString);
    }

    function toggleTheme() {
      document.body.classList.toggle("dark-theme");
    }

    function toggleView() {
      weeklyView.classList.toggle("active");
      if (weeklyView.classList.contains("active")) {
        renderWeeklyView();
        viewToggle.innerText = "Switch to Monthly View";
      } else {
        renderCalendar();
        viewToggle.innerText = "Switch to Weekly View";
      }
    }

    function renderWeeklyView() {
      weeklyView.innerHTML = '';
      let firstDayOfWeek = selectedDate.getDate() - selectedDate.getDay();
      for (let i = 0; i < 7; i++) {
        let day = new Date(selectedDate.setDate(firstDayOfWeek + i));
        let dayString = day.toISOString().split('T')[0];
        let dayEvents = events[dayString] || [];
        let dayEventCount = dayEvents.length;
        weeklyView.innerHTML += `
          <div class="day" onclick="selectDate('${dayString}')">
            ${day.getDate()} <span class="event-count">${dayEventCount > 0 ? `(${dayEventCount})` : ''}</span>
          </div>
        `;
      }
    }

    document.getElementById("themeToggle").addEventListener("click", toggleTheme);
    viewToggle.addEventListener("click", toggleView);
    monthSelect.addEventListener("change", (e) => { currentMonth = e.target.value; renderCalendar(); });
    yearSelect.addEventListener("change", (e) => { currentYear = e.target.value; renderCalendar(); });

    // Initialize Calendar
    renderCalendar();