// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Desktop } from '@/components/garage/os/Desktop';
import { getProfile } from '@/content';
import { MODEL_CREDIT } from '@/content/credits';
import type { Locale } from '@/content/types';
import { INITIAL_DESKTOP, reduceDesktop, type DesktopAction, type DesktopState, type ProgramId } from '@/lib/garage/desktop';
import en from '@/messages/en.json';
import pt from '@/messages/pt.json';

const MESSAGES = { pt, en };
const SIZE = { width: 960, height: 720 };

function withOpen(...ids: ProgramId[]): DesktopState {
  return ids.reduce((s, id) => reduceDesktop(s, { type: 'open', id }).state, INITIAL_DESKTOP);
}

function show(
  locale: Locale,
  state: DesktopState = INITIAL_DESKTOP,
  opts: { compact?: boolean; dispatch?: (a: DesktopAction) => void; onLanguage?: () => void; toggle?: () => void } = {},
  size = SIZE,
) {
  const dispatch = opts.dispatch ?? vi.fn();
  const onLanguage = opts.onLanguage ?? vi.fn();
  const toggle = opts.toggle ?? vi.fn();
  const tree = (s: DesktopState) => (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      <Desktop
        profile={getProfile(locale)}
        locale={locale}
        state={s}
        size={size}
        compact={opts.compact ?? false}
        dispatch={dispatch}
        onLanguage={onLanguage}
        sound={{ muted: false, toggle }}
      />
    </NextIntlClientProvider>
  );
  const view = render(tree(state));
  return { dispatch, onLanguage, toggle, rerender: (s: DesktopState) => view.rerender(tree(s)) };
}

const icon = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name.replace('.', '\\.')}$`) });
const windowNamed = (title: string) => screen.getByRole('dialog', { name: title });

afterEach(cleanup);

describe('LuisOS 88 desktop', () => {
  it('shows the seven icons in order', () => {
    show('pt');
    const names = screen.getAllByTestId('os-icon').map((b) => b.textContent);
    expect(names).toEqual(['Currículo.txt', 'Projetos', 'Contato', 'Salto88.exe', 'Painel de controle', 'Leia-me.txt', 'Lixeira']);
    cleanup();
    show('en');
    expect(screen.getAllByTestId('os-icon').map((b) => b.textContent)).toEqual([
      'Resume.txt',
      'Projects',
      'Contact',
      'Salto88.exe',
      'Control panel',
      'Readme.txt',
      'Trash',
    ]);
  });

  it('click selects, double click and Enter open', () => {
    const { dispatch } = show('pt');
    fireEvent.click(icon('Currículo.txt'), { detail: 1 });
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'select', icon: 'cv' });
    fireEvent.doubleClick(icon('Currículo.txt'));
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'open', id: 'cv' });
    fireEvent.keyDown(icon('Contato'), { key: 'Enter' });
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'open', id: 'contact' });
  });

  it('on a phone one tap opens and windows are maximized', () => {
    const { dispatch } = show('pt', withOpen('projects'), { compact: true });
    fireEvent.click(icon('Contato'));
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'open', id: 'contact' });
    const win = windowNamed('Projetos');
    expect(win.style.left).toBe('0px');
    expect(win.style.width).toBe(`${SIZE.width}px`);
  });

  it('a click with no pointer behind it (Space, a screen reader) opens, in a folder too', () => {
    const { dispatch } = show('pt', withOpen('projects'));
    fireEvent.click(icon('Contato'), { detail: 0 });
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'open', id: 'contact' });
    fireEvent.click(within(windowNamed('Projetos')).getByRole('button', { name: 'migracao-gcp-aws.txt' }), { detail: 0 });
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'open', id: 'case:migracao-gcp-aws' });
  });

  it('raising a window restacks it without moving its node (a drag keeps its pointer capture)', () => {
    const before = withOpen('cv', 'contact');
    const view = show('pt', before);
    const cv = windowNamed('Currículo.txt');
    const order = () => screen.getAllByRole('dialog').map((d) => d.getAttribute('data-program'));
    const was = order();
    const after = reduceDesktop(before, { type: 'focus', id: 'cv' }).state;
    view.rerender(after);
    expect(windowNamed('Currículo.txt')).toBe(cv);
    expect(order()).toEqual(was);
    expect(Number(cv.style.zIndex)).toBeGreaterThan(Number(windowNamed('Contato').style.zIndex));
  });

  it('a window opens right of the icon column and fits the desktop', () => {
    show('pt', withOpen('cv'));
    const win = windowNamed('Currículo.txt');
    expect(win.style.left).toBe('136px');
    expect(parseFloat(win.style.left) + parseFloat(win.style.width)).toBeLessThanOrEqual(SIZE.width);
    cleanup();
    show('pt', withOpen('cv'), {}, { width: 700, height: 520 });
    const narrow = windowNamed('Currículo.txt');
    expect(parseFloat(narrow.style.left) + parseFloat(narrow.style.width)).toBeLessThanOrEqual(700);
  });

  it('the launch dialog is a small window, as tall as its text', () => {
    show('pt', reduceDesktop(INITIAL_DESKTOP, { type: 'play' }).state);
    const win = windowNamed('Salto88.exe');
    expect(parseFloat(win.style.width)).toBeLessThanOrEqual(440);
    expect(win.style.height).toBe('');
  });

  it('a window shows its program and closes', () => {
    const { dispatch } = show('pt', withOpen('cv'));
    const win = windowNamed('Currículo.txt');
    expect(within(win).getByRole('heading', { name: 'Experiência' })).toBeTruthy();
    fireEvent.click(within(win).getAllByRole('button', { name: 'Fechar (Esc)' })[0]);
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'close', id: 'cv' });
  });

  it('the projects folder lists the five cases and opens one', () => {
    const { dispatch } = show('pt', withOpen('projects'));
    const win = windowNamed('Projetos');
    const files = within(win)
      .getAllByRole('button')
      .map((b) => b.textContent)
      .filter((t) => t?.endsWith('.txt'));
    expect(files).toEqual([
      'arquitetura-llm-first.txt',
      'migracao-gcp-aws.txt',
      'whatsapp-tech-provider.txt',
      'oceans-20.txt',
      'vistoria-porto-seguro.txt',
    ]);
    fireEvent.doubleClick(within(win).getByRole('button', { name: 'migracao-gcp-aws.txt' }));
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'open', id: 'case:migracao-gcp-aws' });
    cleanup();
    show('pt', withOpen('case:migracao-gcp-aws'));
    expect(within(windowNamed('migracao-gcp-aws.txt')).getByText('Migração GCP → AWS')).toBeTruthy();
  });

  it('the contact has no phone', () => {
    show('pt', withOpen('contact'));
    expect(windowNamed('Contato').textContent).not.toMatch(/\+?\d[\d\s()-]{8,}/);
  });

  it('the control panel names the car model and drives sound and language', () => {
    const { onLanguage, toggle } = show('pt', withOpen('control'));
    const win = windowNamed('Painel de controle');
    expect(win.textContent).toContain(MODEL_CREDIT.author);
    expect(win.textContent).toContain(MODEL_CREDIT.license);
    fireEvent.click(within(win).getByRole('button', { name: /Som/ }));
    expect(toggle).toHaveBeenCalled();
    const lang = within(win).getByRole('button', { name: 'English' });
    expect(lang.textContent).toBe(pt.Os.languageSwitch);
    fireEvent.click(lang);
    expect(onLanguage).toHaveBeenCalled();
  });

  it('the readme, the trash and the launch dialog', () => {
    show('pt', withOpen('readme'));
    const readme = windowNamed('Leia-me.txt');
    expect(readme.textContent).toContain(getProfile('pt').headline);
    expect(readme.textContent).toContain('Teclas: C currículo');
    cleanup();
    const { dispatch } = show('pt', withOpen('trash'));
    fireEvent.doubleClick(within(windowNamed('Lixeira')).getByRole('button', { name: 'bug_88mph.log' }));
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'open', id: 'bug' });
    cleanup();
    show('pt', withOpen('bug'));
    expect(windowNamed('bug_88mph.log').textContent).toContain('Acelere até 88 mph.');
    cleanup();
    show('pt', reduceDesktop(INITIAL_DESKTOP, { type: 'play' }).state);
    expect(windowNamed('Salto88.exe').textContent).toContain('Destino: fev 2019');
    expect(windowNamed('Salto88.exe').textContent).not.toContain('Game in Portuguese');
    cleanup();
    show('en', reduceDesktop(INITIAL_DESKTOP, { type: 'play' }).state);
    expect(windowNamed('Salto88.exe').textContent).toContain('Destination: Feb 2019');
    expect(windowNamed('Salto88.exe').textContent).toContain('Game in Portuguese for now');
  });

  it('the menu Help opens the readme', () => {
    const { dispatch } = show('pt');
    fireEvent.click(screen.getByRole('button', { name: 'Ajuda' }));
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'open', id: 'readme' });
  });
});
