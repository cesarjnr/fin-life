import Logo from '../../components/logo';
import Button from '../../components/button';
import Input from '../../components/input';

export default function SignUp() {
  return (
    <div className="h-full flex justify-center items-center">
      <div className="bg-black-800 px-14 py-10 flex flex-col gap-20">
        <div className="text-center">
          <Logo fontSize="text-3xl" />
          <span className="font-semibold">
            Sua vida financeira em um só lugar
          </span>
        </div>
        <form className="flex flex-col gap-8">
          <Input
            isPassword={false}
            name="name"
            placeholder="Nome"
            type="text"
          />
          <Input
            isPassword={false}
            name="email"
            placeholder="Email"
            type="text"
          />
          <Input
            isPassword={true}
            name="password"
            placeholder="Senha"
            type="text"
          />
          <Button label="Criar Conta" variant='primary' />
        </form>
        <div className="flex flex-col font-semibold text-center">
          <span>Já tem uma conta?</span>
          <a href="" className="text-green-500 hover:text-green-600">Entrar</a>
        </div>
      </div>
    </div>
  );
}
