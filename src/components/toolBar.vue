<template>
    <q-toolbar class="menu-toolbar">
      <q-btn flat round dense class="menu-btn">
        <q-icon name="home" size="md" />
      </q-btn>
      <q-btn flat round dense class="menu-btn">
        <q-icon name="store" size="md" />
      </q-btn>
      <q-btn flat round dense class="menu-btn">
        <q-icon name="inventory" size="md" />
      </q-btn>
      <q-btn flat round dense class="menu-btn">
        <q-icon name="settings" size="md" />
      </q-btn>
      <q-btn flat round dense class="menu-btn">
        <q-icon name="account_circle" size="md" />
      </q-btn>
    </q-toolbar>
  </template>

<style scoped>
.menu-toolbar {
  background-color: #607D8B; /* Slate Gray */
  padding: 10px;
  display: flex;
  justify-content: space-evenly;/* Align items horizontally */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Add subtle shadow */
  border-radius: 10px;
margin-top: 65px;
}

.menu-btn {
  color: white; /* Icon and button color */
  margin: 0 10px; /* Space between icons */
}

.menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.1); /* Hover effect */
}

.menu-toolbar .q-icon {
  font-size: 24px;
}
</style>