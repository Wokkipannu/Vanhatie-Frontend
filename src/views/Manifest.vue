<template>
  <b-container class="my-5">
    <h4>Miksi lähdin killasta?</h4>
    <p>Luo oma manifestisi</p>
    <hr/>
    <b-form-group v-for="(reason, index) in reasons" :key="index">
      <b-form-checkbox :id="'checkbox-' + index" v-model="selected[index]">
        {{ reason }}
      </b-form-checkbox>
    </b-form-group>

    <b-input-group v-for="(custom, index) in customs" :key="index">
      <b-form-input v-model="customs[index]"></b-form-input>
      <b-input-group-append>
        <b-button variant="outline-danger" v-on:click="removeCustom(index)"><b-icon icon="trash-fill"></b-icon></b-button>
      </b-input-group-append>
    </b-input-group>

    <b-form-group description="Kirjoita omavalintainen syy ja klikkaa +" labels="Syötä syy" class="my-2">
      <b-input-group>
        <b-form-input v-model="custom"></b-form-input>
        <b-input-group-append>
          <b-button variant="outline-success" v-on:click="addCustom"><b-icon icon="plus"></b-icon></b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>

    <b-form-textarea rows="5" v-model="manifest"></b-form-textarea>
  </b-container>
</template>

<script>
export default {
  name: 'manifest',
  data() {
    return {
      reasons: [
        "Raidaamisen ohella pelissä ei ole minulle mielekästä tekemistä. En muista tiedä, mutta kullan/materiaalien farmaaminen seuraavaa raidia varten ei ole mielestäni kovin hohdokasta gameplaytä.",
        "Skelen mielivaltaiset loottisäännöt ja niiden noudattaminen sillon kun siltä tuntuu, en jaksa olla se henkilö joka aina kyylää ja huomauttaa joka asiasta.",
        "Ilmeisesti muilla rogueilla on oma rinkirunkku josta ei minulle ole ilmoitettu eikä siihen kutsuttu, teille sanon suoraan että vetäkää käteen ja nauttikaa looteistanne."
      ],
      selected: [],
      custom: "",
      customs: [],
      manifest: "Miksi lähdin killasta?"
    }
  },
  watch: {
    selected: function() {
      this.createManifest();
    },
    customs: function() {
      this.createManifest();
    }
  },
  methods: {
    createManifest() {
      this.manifest = "Miksi lähdin killasta?";
      let number = 1;
      this.selected.forEach((selected, index) => {
        if (selected) {
          this.manifest += `\n${number}. ${this.reasons[index]}`;
          number++;
        }
      });
      this.customs.forEach(custom => {
        this.manifest += `\n${number}. ${custom}`;
        number++;
      });
    },

    addCustom() {
      if (this.custom === "") return;
      this.customs.push(this.custom);
      this.custom = "";
    },

    removeCustom(index) {
      this.customs.splice(index, 1);
    }
  }
}
</script>